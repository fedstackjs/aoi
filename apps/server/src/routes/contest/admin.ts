import { ContestCapability, contests } from '../../index.js'
import { ensureCapability } from '../../utils/index.js'
import { manageACL } from '../common/acl.js'
import { defineRoutes } from '../common/index.js'

export const adminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    ensureCapability(req._contestCapability, ContestCapability.CAP_ADMIN, s.httpErrors.forbidden())
  })

  s.register(manageACL, {
    collection: contests,
    resolve: async (req) => req._contestId,
    defaultCapability: ContestCapability.CAP_ACCESS,
    prefix: '/access'
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
      await contests.deleteOne({ _id: req._contestId })
      return {}
    }
  )
})
