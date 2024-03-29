import { nextTick } from 'vue'

import { sleep } from '../async'

import FileWorker from './hash.worker?worker'

export type ProgressCallback = (progress: number, digest?: string) => void

export function computeSHA256Progress(file: File, callback?: ProgressCallback): Promise<string> {
  const size = file.size
  const stream = file.stream()
  try {
    const worker = new FileWorker()
    worker.postMessage(stream, [stream])
    return new Promise<string>((resolve) => {
      worker.addEventListener('message', (ev) => {
        const { read, digest } = ev.data
        callback?.(read / size, digest)
        if (digest) {
          resolve(digest)
          worker.terminate()
        }
      })
    })
  } catch {
    return import('./hash').then(({ calculateHashCallback }) =>
      calculateHashCallback(stream, async ({ read, digest }) => {
        callback?.(read / size, digest)
        await nextTick()
        await sleep(0)
      })
    )
  }
}
