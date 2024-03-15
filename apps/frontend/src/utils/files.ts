import FileWorker from './files.worker?worker'

export function computeSHA256Progress(
  file: File,
  callback?: (progress: number, digest?: string) => void
) {
  const size = file.size
  const stream = file.stream()
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
}
