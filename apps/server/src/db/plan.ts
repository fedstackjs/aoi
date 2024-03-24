import { BSON, Collection } from 'mongodb'
import { IPrincipalControlable, IWithAccessLevel, IWithContent } from './common.js'
import { capabilityMask } from '../utils/index.js'
import { IPlanContestSettings, IPlanSettings } from '../schemas/index.js'
import { fastifyPlugin } from 'fastify-plugin'

export const PLAN_CAPS = {
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
  createdAt: number
  updatedAt: number
}

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

declare module './index.js' {
  interface IDbContainer {
    plans: Collection<IPlan>
    planParticipants: Collection<IPlanParticipant>
  }
}

export const dbPlanPlugin = fastifyPlugin(async (s) => {
  const plans = s.db.db.collection<IPlan>('plan')
  await plans.createIndex({ orgId: 1, slug: 1 }, { unique: true })
  await plans.createIndex({ orgId: 1, tags: 1 })
  s.db.plans = plans

  const planParticipants = s.db.db.collection<IPlanParticipant>('planParticipants')
  await planParticipants.createIndex({ userId: 1, planId: 1 }, { unique: true })
  s.db.planParticipants = planParticipants
})
