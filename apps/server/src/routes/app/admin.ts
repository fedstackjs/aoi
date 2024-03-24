import { randomBytes } from 'node:crypto'
import { APP_CAPS } from '../../db/index.js'
import { SAppSettings } from '../../index.js'
import { hasCapability } from '../../utils/index.js'
import { manageACL, manageAccessLevel } from '../common/access.js'
import { defineRoutes } from '../common/index.js'
import { manageSettings } from '../common/settings.js'
import { kAppContext } from './inject.js'
import { Type } from '@sinclair/typebox'

export const appAdminRoutes = defineRoutes(async (s) => {
  const { apps } = s.db

  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kAppContext)
    if (!hasCapability(ctx.capability, APP_CAPS.CAP_ADMIN)) return rep.forbidden()
  })

  s.register(manageACL, {
    collection: apps,
    resolve: async (req) => req.inject(kAppContext).app._id,
    defaultCapability: APP_CAPS.CAP_ACCESS,
    prefix: '/access'
  })

  s.register(manageAccessLevel, {
    collection: apps,
    resolve: async (req) => req.inject(kAppContext).app._id,
    prefix: '/accessLevel'
  })

  s.register(manageSettings, {
    collection: apps,
    resolve: async (req) => req.inject(kAppContext).app._id,
    schema: SAppSettings,
    prefix: '/settings'
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete app'
      }
    },
    async (req) => {
      await apps.deleteOne({ _id: req.inject(kAppContext).app._id })
      return 0
    }
  )

  s.post(
    '/revoke-secret',
    {
      schema: {
        description: 'Revoke app secret',
        response: {
          200: Type.Object({
            secret: Type.String()
          })
        }
      }
    },
    async (req) => {
      const app = req.inject(kAppContext).app
      const secret = randomBytes(32).toString('base64url')
      await apps.updateOne({ _id: app._id }, { $set: { secret } })
      return { secret }
    }
  )
})
