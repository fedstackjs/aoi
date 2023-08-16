import { BSON } from 'mongodb'
import { db } from './client.js'
import { capabilityMask } from '../utils/capability.js'
import { IOrgProfile, IOrgSettings } from '../schemas/index.js'

export const OrgCapability = {
  CAP_ACCESS: capabilityMask(0),
  CAP_ADMIN: capabilityMask(1),
  CAP_PROBLEM: capabilityMask(2),
  CAP_CONTEST: capabilityMask(3),
  CAP_PLAN: capabilityMask(4)
}

export interface IOrg {
  _id: BSON.UUID

  ownerId: BSON.UUID
  profile: IOrgProfile
  settings: IOrgSettings
}

export const orgs = db.collection<IOrg>('orgs')
await orgs.createIndex({ 'profile.name': 1 }, { unique: true })

export interface IOrgMembership {
  _id: BSON.UUID
  userId: BSON.UUID
  orgId: BSON.UUID
  capability: BSON.Long
  groups: BSON.UUID[]
}

export const orgMemberships = db.collection<IOrgMembership>('orgMemberships')
await orgMemberships.createIndex({ userId: 1, orgId: 1 }, { unique: true })
