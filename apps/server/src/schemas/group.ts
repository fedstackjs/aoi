import { Type, Static } from '@sinclair/typebox'
import { StrictObject } from './common.js'

export const SGroupProfile = StrictObject({
  name: Type.String(),
  email: Type.String()
})
export interface IGroupProfile extends Static<typeof SGroupProfile> {}
