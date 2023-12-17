import { Sha256 } from '@aws-crypto/sha256-browser'

function Uint8ArrayToHex(u8a: Uint8Array) {
  let result = ''
  const h = '0123456789abcdef'
  for (let i = 0; i < u8a.length; i++) {
    result += h[u8a[i] >> 4] + h[u8a[i] & 15]
  }
  return result
}

export async function computeSHA256(file: File) {
  const hash = new Sha256()
  const reader = file.stream().getReader()
  let done = false
  do {
    const { value, done: _done } = await reader.read()
    if (value) hash.update(value)
    done = _done
  } while (!done)
  return Uint8ArrayToHex(await hash.digest())
}
