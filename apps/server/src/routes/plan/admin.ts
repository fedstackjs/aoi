import { PlanCapacity, hasCapability, plans } from '../../index.js'
import { manageACL, manageAccessLevel } from '../common/access.js'
import { defineRoutes } from '../common/index.js'

export const planAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (!hasCapability(req._planCapability, PlanCapacity.CAP_ADMIN)) return rep.forbidden()
  })

  s.register(manageACL, {
    collection: plans,
    resolve: async (req) => req._plan._id,
    defaultCapability: PlanCapacity.CAP_ACCESS,
    prefix: '/access'
  })
  s.register(manageAccessLevel, {
    collection: plans,
    resolve: async (req) => req._plan._id,
    prefix: '/accessLevel'
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete contest'
      }
    },
    async (req) => {
      // TODO: handle dependencies
      await plans.deleteOne({ _id: req._plan._id })
      return {}
    }
  )
})
