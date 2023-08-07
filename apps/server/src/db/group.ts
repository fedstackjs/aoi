import { BSON } from 'mongodb'
import { db } from './client.js'
import { capabilityMask } from '../utils/capability.js'
import { IGroupProfile } from '../schemas/index.js'

export const GroupCapability = {
  CAP_ACCESS: capabilityMask(0)
}

export interface IGroup {
  _id: BSON.UUID

  orgId: BSON.UUID
  profile: IGroupProfile
}

export const groups = db.collection<IGroup>('groups')
await groups.createIndex({ orgId: 1 })
