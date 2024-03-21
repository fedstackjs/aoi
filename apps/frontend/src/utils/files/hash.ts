import { Sha256 } from '@aws-crypto/sha256-browser'

function Uint8ArrayToHex(u8a: Uint8Array) {
  let result = ''
  const h = '0123456789abcdef'
  for (let i = 0; i < u8a.length; i++) {
    result += h[u8a[i] >> 4] + h[u8a[i] & 15]
  }
  return result
}

export async function calculateHashCallback(
  stream: ReadableStream,
  callback: (data: { read: number; digest?: string }) => void | Promise<void>
) {
  const hash = new Sha256()
  const reader = stream.getReader()
  let done = false
  let read = 0
  do {
    const { value, done: _done } = await reader.read()
    if (value) hash.update(value)
    done = _done
    read += value?.length || 0
    await callback({ read })
  } while (!done)
  const digest = Uint8ArrayToHex(await hash.digest())
  await callback({ digest, read })
  return digest
}
