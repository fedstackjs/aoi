import { Static, Type } from '@sinclair/typebox'
import { SBaseProfile } from './common.js'

export const SGroupProfile = Type.NoAdditionalProperties(SBaseProfile)
export interface IGroupProfile extends Static<typeof SGroupProfile> {}
