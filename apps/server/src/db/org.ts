import { BSON } from 'mongodb'
import { Static, Type } from '@sinclair/typebox'
import { StrictObject } from '../utils/types.js'
import { db } from './client.js'
import { capabilityMask } from '../utils/capability.js'

export const OrgCapability = {
  CAP_ACCESS: capabilityMask(0),
  CAP_CREATE: capabilityMask(1)
}

export const OrgProfileSchema = StrictObject({
  name: Type.String(),
  email: Type.String()
})

export interface IOrgProfile extends Static<typeof OrgProfileSchema> {}

export const OrgSettings = StrictObject({
  //
})

export interface IOrgSettings extends Static<typeof OrgSettings> {}

export interface IOrg {
  _id: BSON.UUID

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
