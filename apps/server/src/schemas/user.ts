import { Type, Static } from '@sinclair/typebox'

export const SUserProfile = Type.StrictObject({
  name: Type.String(),
  email: Type.String({ pattern: '^\\S+@\\S+$' }),
  realname: Type.String(),
  telephone: Type.Optional(Type.String({ pattern: '^\\d{11}$' })),
  school: Type.Optional(Type.String()),
  studentGrade: Type.Optional(Type.String()),
  verified: Type.Optional(Type.Array(Type.String()))
})

export interface IUserProfile extends Static<typeof SUserProfile> {}
