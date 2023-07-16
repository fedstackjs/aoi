import { Static, Type } from '@sinclair/typebox'
import { StrictObject } from '../utils/types.js'
import { BSON } from 'mongodb'
import { db } from './client.js'
import { capabilityMask } from '../utils/capability.js'

export const GroupCapability = {
  CAP_ACCESS: capabilityMask(0)
}

export const GroupProfileSchema = StrictObject({
  name: Type.String(),
  email: Type.String()
})

export interface IGroupProfile extends Static<typeof GroupProfileSchema> {}

export interface IGroup {
  _id: BSON.UUID

  orgId: BSON.UUID
  profile: IGroupProfile
}

export const groups = db.collection<IGroup>('groups')
await groups.createIndex({ orgId: 1 })
