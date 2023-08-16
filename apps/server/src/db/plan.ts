import { BSON } from 'mongodb'
import {
  IPrincipalControlable,
  IWithAccessLevel,
  IWithContent,
  capabilityMask,
  db
} from '../index.js'
import { IPlanContestSettings } from '../schemas/plan.js'

export const PlanCapacity = {
  CAP_ACCESS: capabilityMask(0),
  CAP_ADMIN: capabilityMask(1),
  CAP_CONTENT: capabilityMask(2)
}

export interface IPlanParticipant {
  _id: BSON.UUID
  userId: BSON.UUID
  planId: BSON.UUID
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
}

export const plans = db.collection<IPlan>('plan')
