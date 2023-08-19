import { Type } from '@sinclair/typebox'
import {
  defineRoutes,
  loadCapability,
  loadMembership,
  paramSchemaMerger,
  tryLoadUUID
} from '../common/index.js'
import { IPlan, IPlanParticipant, PlanCapacity, planParticipants, plans } from '../../db/index.js'
import { CAP_ALL, hasCapability } from '../../utils/index.js'
import { BSON } from 'mongodb'
import { manageContent } from '../common/content.js'
import { planAdminRoutes } from './admin.js'
import { planContestRoutes } from './contest/index.js'

declare module 'fastify' {
  interface FastifyRequest {
    _plan: IPlan
    _planCapability: BSON.Long
    _planParticipant: IPlanParticipant | null
  }
}

export const planScopedRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        planId: Type.UUID()
      })
    )
  )

  s.addHook('onRequest', async (req, rep) => {
    const planId = tryLoadUUID(req.params, 'planId')
    if (!planId) return rep.notFound()
    const plan = await plans.findOne({ _id: planId })
    if (!plan) return rep.notFound()
    const membership = await loadMembership(req.user.userId, plan.orgId)
    const capability = loadCapability(
      plan,
      membership,
      PlanCapacity.CAP_ADMIN,
      PlanCapacity.CAP_ACCESS,
      CAP_ALL
    )
    if (!hasCapability(capability, PlanCapacity.CAP_ACCESS)) return rep.forbidden()
    req._plan = plan
    req._planCapability = capability
    req._planParticipant = await planParticipants.findOne({
      planId: plan._id,
      userId: req.user.userId
    })
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get plan details',
        response: {
          200: Type.Object({
            _id: Type.UUID(),
            orgId: Type.UUID(),
            accessLevel: Type.AccessLevel(),
            slug: Type.String(),
            title: Type.String(),
            description: Type.String(),
            tags: Type.Array(Type.String())
          })
        }
      }
    },
    async (req) => {
      return req._plan
    }
  )

  s.post(
    '/register',
    {
      schema: {
        description: 'Register for a plan',
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      return rep.notImplemented()
    }
  )

  s.register(manageContent, {
    collection: plans,
    resolve: async (req) => {
      if (!hasCapability(req._planCapability, PlanCapacity.CAP_CONTENT)) return null
      return req._plan._id
    },
    prefix: '/content'
  })

  s.register(planContestRoutes, { prefix: '/contest' })
  s.register(planAdminRoutes, { prefix: '/admin' })
})
