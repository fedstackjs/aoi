import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { prettyHTTPError } from './http'

const kAsyncTaskMessage = Symbol('AsyncTaskMessage')
const kNoMessage = Symbol('NoMessage')

export function withMessage<T>(message: string, value?: T): { value?: T } {
  return { [kAsyncTaskMessage]: message, value } as { value?: T }
}

export function noMessage<T>(value?: T): { value?: T } {
  return { [kNoMessage]: true, value } as { value?: T }
}

function hasMessage<T>(value: unknown): value is { [kAsyncTaskMessage]: string; value: T } {
  return typeof value === 'object' && value !== null && kAsyncTaskMessage in value
}

export function hasNoMessage<T>(value: unknown): value is { [kNoMessage]: true; value: T } {
  return typeof value === 'object' && value !== null && kNoMessage in value
}

export function getMessage(value: unknown): string | undefined {
  return hasMessage(value) ? value[kAsyncTaskMessage] : undefined
}

export function useAsyncTask(task: () => Promise<unknown>) {
  const toast = useToast()
  const { t } = useI18n()
  const isLoading = ref(false)
  const execute = async () => {
    if (isLoading.value) return
    isLoading.value = true
    try {
      const result = await task()
      if (!hasNoMessage(result)) {
        toast.success(getMessage(result) ?? t('msg.operation-success'))
      }
    } catch (err) {
      toast.error(await prettyHTTPError(err))
    }
    isLoading.value = false
  }
  return { isLoading, execute }
}

interface IAsyncQueueItem<T> {
  factory(): Promise<T>
  resolve(value: T): void
}

export class AsyncQueue {
  private _queue: IAsyncQueueItem<unknown>[] = []
  private _running = 0

  constructor(private _concurrency: number = 1) {}

  enqueue<T>(factory: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve) => {
      this._queue.push({ factory, resolve })
      this._run()
    })
  }

  private async _run() {
    if (this._running >= this._concurrency) return
    this._running++
    while (this._queue.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { factory, resolve } = this._queue.shift()!
      resolve(await factory())
    }
    this._running--
  }
}

interface IBatchingQueueItem<T, R> {
  item: T
  resolve(value: R): void
  reject(err: unknown): void
}

export class BatchingQueue<T, R> {
  private _queue: IBatchingQueueItem<T, R>[] = []
  private _timer: ReturnType<typeof setTimeout> | undefined

  constructor(
    private handler: (items: T[]) => Promise<R[]>,
    private maxBatchSize = 30,
    private maxBatchMs = 500
  ) {}

  enqueue(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this._queue.push({ item, resolve, reject })
      this._check()
    })
  }

  private async _check() {
    if (this._timer) clearTimeout(this._timer)
    if (this._queue.length >= this.maxBatchSize) {
      this._run()
    }
    if (!this._queue.length) return
    this._timer = setTimeout(() => this._run(), this.maxBatchMs)
  }

  private _run() {
    const entries = this._queue.splice(0, this.maxBatchSize)
    const items = entries.map(({ item }) => item)
    this.handler(items)
      .then((results) => entries.forEach(({ resolve }, i) => resolve(results[i])))
      .catch((err) => entries.forEach(({ reject }) => reject(err)))
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
