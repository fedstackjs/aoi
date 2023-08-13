import { Type, Static } from '@sinclair/typebox'
import { SBaseProfile } from './common.js'

export const SUserProfile = Type.NoAdditionalProperties(
  Type.Intersect([
    SBaseProfile,
    Type.Object({
      realname: Type.String()
    })
  ])
)

export interface IUserProfile extends Static<typeof SUserProfile> {}
