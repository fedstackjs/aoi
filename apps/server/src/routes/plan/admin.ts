import { PlanCapacity, SPlanSettings, hasCapability, plans } from '../../index.js'
import { manageACL, manageAccessLevel } from '../common/access.js'
import { defineRoutes } from '../common/index.js'
import { manageSettings } from '../common/settings.js'
import { kPlanContext } from './inject.js'

export const planAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kPlanContext)
    if (!hasCapability(ctx._planCapability, PlanCapacity.CAP_ADMIN)) return rep.forbidden()
  })

  s.register(manageACL, {
    collection: plans,
    resolve: async (req) => req.inject(kPlanContext)._plan._id,
    defaultCapability: PlanCapacity.CAP_ACCESS,
    prefix: '/access'
  })
  s.register(manageAccessLevel, {
    collection: plans,
    resolve: async (req) => req.inject(kPlanContext)._plan._id,
    prefix: '/accessLevel'
  })

  s.register(manageSettings, {
    collection: plans,
    resolve: async (req) => req.inject(kPlanContext)._plan._id,
    schema: SPlanSettings,
    prefix: '/settings'
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete plain'
      }
    },
    async (req) => {
      // TODO: handle dependencies
      await plans.deleteOne({ _id: req.inject(kPlanContext)._plan._id })
      return {}
    }
  )
})
