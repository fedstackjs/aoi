import { Static, Type } from '@sinclair/typebox'
import { StrictObject } from './common.js'

export const SOrgProfile = StrictObject({
  name: Type.String(),
  email: Type.String({ format: 'email' })
})
export interface IOrgProfile extends Static<typeof SOrgProfile> {}

export const SOrgOssSettings = StrictObject({
  bucket: Type.String(),
  accessKey: Type.String(),
  secretKey: Type.String(),
  region: Type.Optional(Type.String()),
  endpoint: Type.Optional(Type.String()), // The default is AWS S3
  pathStyle: Type.Optional(Type.Boolean())
})
export interface IOrgOssSettings extends Static<typeof SOrgOssSettings> {}

export const SOrgSettings = StrictObject({
  oss: Type.Optional(SOrgOssSettings)
})
export interface IOrgSettings extends Static<typeof SOrgSettings> {}
