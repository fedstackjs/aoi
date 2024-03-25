import { T, Static, SBaseProfile } from './common.js'

export const SOrgProfile = T.NoAdditionalProperties(SBaseProfile)
export interface IOrgProfile extends Static<typeof SOrgProfile> {}

export const SOrgOssSettings = T.StrictObject({
  bucket: T.String(),
  accessKey: T.String(),
  secretKey: T.String(),
  region: T.Optional(T.String()),
  endpoint: T.Optional(T.String()), // The default is AWS S3
  pathStyle: T.Optional(T.Boolean())
})
export interface IOrgOssSettings extends Static<typeof SOrgOssSettings> {}

export const SOrgSettings = T.StrictObject({
  oss: T.Optional(SOrgOssSettings)
})
export interface IOrgSettings extends Static<typeof SOrgSettings> {}
