import { ProblemCapability, problems } from '../../db/index.js'
import { defineRoutes } from '../common/index.js'
import { ensureCapability } from '../../utils/capability.js'
import { manageACL, manageAccessLevel } from '../common/access.js'

export const adminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    ensureCapability(req._problemCapability, ProblemCapability.CAP_ADMIN, s.httpErrors.forbidden())
  })

  s.register(manageACL, {
    collection: problems,
    resolve: async (req) => req._problemId,
    defaultCapability: ProblemCapability.CAP_ACCESS,
    prefix: '/access'
  })
  s.register(manageAccessLevel, {
    collection: problems,
    resolve: async (req) => req._problemId,
    prefix: '/accessLevel'
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete problem'
      }
    },
    async (req) => {
      // TODO: handle dependencies
      await problems.deleteOne({ _id: req._problemId })
      return {}
    }
  )
})
