import { BSON } from 'mongodb'
import {
  IPrincipalControlable,
  IWithAccessLevel,
  IWithContent,
  capabilityMask,
  db
} from '../index.js'
import { IPlanContestSettings, IPlanSettings } from '../schemas/plan.js'

export const PlanCapacity = {
  CAP_ACCESS: capabilityMask(0),
  CAP_ADMIN: capabilityMask(1),
  CAP_CONTENT: capabilityMask(2),
  CAP_REGISTRATION: capabilityMask(3)
}

export interface IPlanParticipant {
  _id: BSON.UUID
  userId: BSON.UUID
  planId: BSON.UUID
  results: Record<string, never>
  updatedAt: number
}

export const planParticipants = db.collection<IPlanParticipant>('planParticipants')

export interface IPlanContest {
  contestId: BSON.UUID
  settings: IPlanContestSettings
}

export interface IPlan extends IPrincipalControlable, IWithAccessLevel, IWithContent {
  _id: BSON.UUID
  orgId: BSON.UUID

  contests: IPlanContest[]
  settings: IPlanSettings

  createdAt: number
}

export const plans = db.collection<IPlan>('plan')
await plans.createIndex({ orgId: 1, slug: 1 }, { unique: true })
await plans.createIndex({ orgId: 1, tags: 1 })
await plans.createIndex({ [`associations.principalId`]: 1 })
