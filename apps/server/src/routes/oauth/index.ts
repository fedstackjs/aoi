import { fastifyFormbody } from '@fastify/formbody'
import { UUID } from 'mongodb'

import { IOrgMembership, IUser } from '../../db/index.js'
import { T, SUserProfile } from '../../schemas/index.js'
import { defineRoutes } from '../common/index.js'

import { oauthDeviceRoutes } from './device.js'
import { oauthGithubCompatRoutes } from './githubCompat.js'
import { oauthIaaaCompatRoutes } from './iaaaCompat.js'

export const oauthRoutes = defineRoutes(async (s) => {
  const { apps, users, orgMemberships } = s.db

  await s.register(fastifyFormbody)

  s.post(
    '/access_token',
    {
      schema: {
        description: 'Get access token',
        security: [],
        body: T.Object({
          client_id: T.String(),
          client_secret: T.Optional(T.String()),
          code: T.String()
        }),
        response: {
          200: T.Object({
            access_token: T.String(),
            token_type: T.String(),
            user: T.Optional(
              T.Object({
                profile: SUserProfile,
                capability: T.Optional(T.String()),
                namespace: T.Optional(T.String()),
                tags: T.Optional(T.Array(T.String()))
              })
            ),
            membership: T.Optional(
              T.Object({
                orgId: T.UUID(),
                capability: T.String(),
                groups: T.Array(T.UUID()),
                tags: T.Optional(T.Array(T.String()))
              })
            )
          })
        }
      }
    },
    async (req, rep) => {
      const { code, client_id, client_secret } = req.body
      const { userId, tags } = await req.verifyToken(code)
      const tag = tags?.find((tag) => tag.startsWith(`.oauth.access_token.`))
      if (!tag) return rep.badRequest()

      const appId = tag.slice(20)
      if (appId !== client_id || !UUID.isValid(appId)) return rep.badRequest()

      const app = await apps.findOne({ _id: new UUID(appId) })
      if (!app) return rep.badRequest()
      if (!tags?.includes('.oauth.bypass_secret') && app.secret !== client_secret)
        return rep.badRequest()

      const scopes = app.settings.scopes ?? ['user.details']
      const fullAccess = scopes.some((scope) => scope === '*')
      const jwt = rep
        .newPayload({ userId: userId.toString(), tags: fullAccess ? undefined : scopes })
        .setExpirationTime('7d')
      const token = await rep.sign(jwt)
      let user: (Omit<IUser, 'capability'> & { capability?: string }) | undefined
      if (app.settings.attachUser) {
        const result = await users.findOne({ _id: new UUID(userId) })
        if (!result) return rep.badRequest()
        user = {
          ...result,
          capability: result.capability?.toString()
        }
      }
      let membership: (Omit<IOrgMembership, 'capability'> & { capability: string }) | undefined
      if (app.settings.attachMembership) {
        const result = await orgMemberships.findOne({ orgId: app.orgId, userId: new UUID(userId) })
        if (result) {
          membership = {
            ...result,
            capability: result.capability.toString()
          }
        }
      }
      return { access_token: token, token_type: 'bearer', user, membership }
    }
  )

  s.register(oauthGithubCompatRoutes, { prefix: '/github_compat' })
  s.register(oauthIaaaCompatRoutes, { prefix: '/iaaa_compat' })
  s.register(oauthDeviceRoutes, { prefix: '/device' })
})
