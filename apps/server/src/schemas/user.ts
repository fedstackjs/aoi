import { Type, Static } from '@sinclair/typebox'
import { SBaseProfile, StrictObject } from './common.js'

export const SUserProfile = Type.Intersect([
  SBaseProfile,
  StrictObject({
    realname: Type.String()
  })
])

export interface IUserProfile extends Static<typeof SUserProfile> {}
