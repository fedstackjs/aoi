import { BSON } from 'mongodb'
import { db } from './client.js'
import { capabilityMask } from '../utils/capability.js'
import { IOrgProfile, IOrgSettings } from '../schemas/org.js'

export const OrgCapability = {
  CAP_ACCESS: capabilityMask(0),
  CAP_PROBLEM: capabilityMask(1),
  CAP_ADMIN: capabilityMask(2)
}

export interface IOrg {
  _id: BSON.UUID

  ownerId: BSON.UUID
  profile: IOrgProfile
  settings: IOrgSettings
}

export const orgs = db.collection<IOrg>('orgs')
await orgs.createIndex({ 'profile.name': 1 }, { unique: true })

export interface IGroupMembership {
  groupId: BSON.UUID
  capability: BSON.Long
}

export interface IOrgMembership {
  _id: BSON.UUID
  userId: BSON.UUID
  orgId: BSON.UUID
  capability: BSON.Long
  groups: IGroupMembership[]
}

export const orgMemberships = db.collection<IOrgMembership>('orgMemberships')
await orgMemberships.createIndex({ userId: 1, orgId: 1 }, { unique: true })
