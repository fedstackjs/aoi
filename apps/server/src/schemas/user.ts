import { Type, Static } from '@sinclair/typebox'

export const SUserProfile = Type.StrictObject({
  name: Type.String({ maxLength: 16 }),
  email: Type.String({ maxLength: 128, pattern: '^\\S+@\\S+$' }),
  realname: Type.String({ maxLength: 16 }),
  telephone: Type.Optional(Type.String({ pattern: '^\\d{11}$' })),
  school: Type.Optional(Type.String({ maxLength: 32 })),
  studentGrade: Type.Optional(Type.String({ maxLength: 32 })),
  verified: Type.Optional(Type.Array(Type.String()))
})

export interface IUserProfile extends Static<typeof SUserProfile> {}
