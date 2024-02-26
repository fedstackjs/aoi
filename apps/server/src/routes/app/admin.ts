import { APP_CAPS, apps } from '../../db/index.js'
import { SPlanSettings } from '../../index.js'
import { hasCapability } from '../../utils/index.js'
import { manageACL, manageAccessLevel } from '../common/access.js'
import { defineRoutes } from '../common/index.js'
import { manageSettings } from '../common/settings.js'
import { kAppContext } from './inject.js'

export const appAdminRoutes = defineRoutes(async (s) => {
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
    schema: SPlanSettings,
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
})
