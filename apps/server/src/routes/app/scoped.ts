import { Type } from '@sinclair/typebox'
import { defineRoutes, loadCapability, paramSchemaMerger, tryLoadUUID } from '../common/index.js'
import { APP_CAPS, apps } from '../../db/index.js'
import { CAP_ALL, hasCapability } from '../../utils/index.js'
import { kAppContext } from './inject.js'
import { manageContent } from '../common/content.js'
import { SAppSettings } from '../../schemas/index.js'
import { appAdminRoutes } from './admin.js'

export const appScopedRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        appId: Type.UUID()
      })
    )
  )

  s.addHook('onRequest', async (req, rep) => {
    const appId = tryLoadUUID(req.params, 'appId')
    if (!appId) return rep.notFound()
    const app = await apps.findOne({ _id: appId })
    if (!app) return rep.notFound()
    const membership = await req.loadMembership(app.orgId)
    const capability = loadCapability(
      app,
      membership,
      APP_CAPS.CAP_ADMIN,
      APP_CAPS.CAP_ACCESS,
      CAP_ALL
    )
    if (!hasCapability(capability, APP_CAPS.CAP_ACCESS)) return rep.forbidden()
    req.provide(kAppContext, {
      app,
      capability,
      membership
    })
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get app details',
        response: {
          200: Type.Object({
            _id: Type.UUID(),
            orgId: Type.UUID(),
            accessLevel: Type.AccessLevel(),
            slug: Type.String(),
            title: Type.String(),
            description: Type.String(),
            tags: Type.Array(Type.String()),
            settings: SAppSettings,
            capability: Type.String()
          })
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kAppContext)
      return {
        ...ctx.app,
        capability: ctx.capability.toString()
      }
    }
  )

  s.register(manageContent, {
    collection: apps,
    resolve: async (req) => {
      const ctx = req.inject(kAppContext)

      if (!hasCapability(ctx.capability, APP_CAPS.CAP_CONTENT)) return null
      return ctx.app._id
    },
    prefix: '/content'
  })

  s.post(
    '/authorize',
    {
      schema: {
        description: 'Authorize and login into an app',
        body: Type.Object({
          mfaToken: Type.Optional(Type.String())
        }),
        response: {
          200: Type.Object({
            token: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const { app, capability } = req.inject(kAppContext)
      const { allowPublicLogin } = app.settings
      if (!allowPublicLogin && !hasCapability(capability, APP_CAPS.CAP_LOGIN))
        return rep.forbidden()

      if (app.settings.requireMfa) {
        if (!req.body.mfaToken) return rep.badRequest()
        req.verifyMfa(req.body.mfaToken)
      }

      const token = await rep.jwtSign(
        { userId: req.user.userId.toString(), tags: [`.oauth.access_token.${app._id}`] },
        { expiresIn: '1min' }
      )
      return { token }
    }
  )

  s.register(appAdminRoutes, { prefix: '/admin' })
})
