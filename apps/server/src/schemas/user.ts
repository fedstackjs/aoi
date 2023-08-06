import { Type, Static } from '@sinclair/typebox'
import { StrictObject } from './common.js'

export const SUserProfile = StrictObject({
  username: Type.String(),
  realname: Type.String(),
  email: Type.String()
})

export interface IUserProfile extends Static<typeof SUserProfile> {}
