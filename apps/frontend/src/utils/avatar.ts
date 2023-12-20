import md5 from 'blueimp-md5'

const GRAVATAR_BASE = import.meta.env.VITE_GRAVATAR_BASE ?? `https://www.gravatar.com`

export function getAvatarUrl(mailOrHash: string) {
  mailOrHash = mailOrHash.includes('@') ? md5(mailOrHash) : mailOrHash
  return `${GRAVATAR_BASE}/avatar/${mailOrHash}?d=identicon`
}
