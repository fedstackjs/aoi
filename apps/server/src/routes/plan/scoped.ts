import { Type } from '@sinclair/typebox'
import { defineRoutes, loadCapability, paramSchemaMerger, tryLoadUUID } from '../common/index.js'
import { PLAN_CAPS, planParticipants, plans } from '../../db/index.js'
import { CAP_ALL, hasCapability } from '../../utils/index.js'
import { BSON } from 'mongodb'
import { manageContent } from '../common/content.js'
import { planAdminRoutes } from './admin.js'
import { planContestRoutes } from './contest/index.js'
import { kPlanContext } from './inject.js'

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
    const membership = await req.loadMembership(plan.orgId)
    const capability = loadCapability(
      plan,
      membership,
      PLAN_CAPS.CAP_ADMIN,
      PLAN_CAPS.CAP_ACCESS,
      CAP_ALL
    )
    if (!hasCapability(capability, PLAN_CAPS.CAP_ACCESS)) return rep.forbidden()
    req.provide(kPlanContext, {
      _plan: plan,
      _planCapability: capability,
      _planParticipant: await planParticipants.findOne({
        planId: plan._id,
        userId: req.user.userId
      })
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
            tags: Type.Array(Type.String()),
            capability: Type.String()
          })
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kPlanContext)
      return {
        ...ctx._plan,
        capability: ctx._planCapability.toString()
      }
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
      const ctx = req.inject(kPlanContext)

      const { registrationEnabled, registrationAllowPublic } = ctx._plan.settings
      if (!registrationEnabled && !hasCapability(ctx._planCapability, PLAN_CAPS.CAP_ADMIN)) {
        return rep.forbidden()
      }
      if (
        !registrationAllowPublic &&
        !hasCapability(ctx._planCapability, PLAN_CAPS.CAP_REGISTRATION)
      ) {
        return rep.forbidden()
      }

      await planParticipants.insertOne({
        _id: new BSON.UUID(),
        userId: req.user.userId,
        planId: ctx._plan._id,
        results: {},
        createdAt: req._now,
        updatedAt: req._now
      })
      return {}
    }
  )

  s.get(
    '/self',
    {
      schema: {
        description: 'Get participant details of self',
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kPlanContext)

      if (!ctx._planParticipant) return rep.preconditionFailed()
      return ctx._planParticipant
    }
  )

  s.register(manageContent, {
    collection: plans,
    resolve: async (req) => {
      const ctx = req.inject(kPlanContext)

      if (!hasCapability(ctx._planCapability, PLAN_CAPS.CAP_CONTENT)) return null
      return ctx._plan._id
    },
    prefix: '/content'
  })

  s.register(planContestRoutes, { prefix: '/contest' })
  s.register(planAdminRoutes, { prefix: '/admin' })
})
