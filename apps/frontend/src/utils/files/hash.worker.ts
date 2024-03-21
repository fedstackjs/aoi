import { calculateHashCallback } from './hash'

self.addEventListener('message', async (ev) => {
  const stream: ReadableStream = ev.data
  await calculateHashCallback(stream, (data) => self.postMessage(data))
})
