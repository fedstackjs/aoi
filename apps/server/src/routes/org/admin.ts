import { BSON } from 'mongodb'
import { ensureCapability } from '../../utils/capability.js'
import { defineRoutes } from '../common/index.js'
import { OrgCapability } from '../../db/org.js'

export const orgAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    const capability = req._orgMembership?.capability ?? BSON.Long.ZERO
    ensureCapability(capability, OrgCapability.CAP_ADMIN, s.httpErrors.forbidden())
  })

  s.patch(
    '/ownership',
    {
      schema: {
        tags: ['organization']
      }
    },
    async () => {
      // TODO: change ownership
      throw s.httpErrors.notImplemented()
    }
  )

  s.patch(
    '/settings',
    {
      schema: {
        tags: ['organization']
      }
    },
    async () => {
      // TODO: update settings
      throw s.httpErrors.notImplemented()
    }
  )

  s.delete(
    '/',
    {
      schema: {
        tags: ['organization']
      }
    },
    async () => {
      // TODO: delete org
      throw s.httpErrors.notImplemented()
    }
  )
})
