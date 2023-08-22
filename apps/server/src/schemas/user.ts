import { Type, Static } from '@sinclair/typebox'

export const SUserProfile = Type.StrictObject({
  name: Type.String(),
  email: Type.String(),
  realname: Type.String()
})

export interface IUserProfile extends Static<typeof SUserProfile> {}
