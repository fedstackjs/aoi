import md5 from 'blueimp-md5'

import { gravatarBase } from './flags'

export function getAvatarUrl(mailOrHash: string) {
  mailOrHash = mailOrHash.includes('@') ? md5(mailOrHash) : mailOrHash
  return `${gravatarBase}/${mailOrHash}?d=mp`
}
