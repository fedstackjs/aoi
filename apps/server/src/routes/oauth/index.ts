import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../common/index.js'
import { UUID } from 'mongodb'
import { IOrgMembership, IUser } from '../../db/index.js'
import { SUserProfile } from '../../schemas/index.js'
import { oauthGithubCompatRoutes } from './githubCompat.js'
import fastifyFormbody from '@fastify/formbody'
import { oauthDeviceRoutes } from './device.js'

export const oauthRoutes = defineRoutes(async (s) => {
  const { apps, users, orgMemberships } = s.db

  await s.register(fastifyFormbody)

  s.post(
    '/access_token',
    {
      schema: {
        description: 'Get access token',
        security: [],
        body: Type.Object({
          client_id: Type.String(),
          client_secret: Type.Optional(Type.String()),
          code: Type.String()
        }),
        response: {
          200: Type.Object({
            access_token: Type.String(),
            token_type: Type.String(),
            user: Type.Optional(
              Type.Object({
                profile: SUserProfile,
                capability: Type.Optional(Type.String()),
                namespace: Type.Optional(Type.String()),
                tags: Type.Optional(Type.Array(Type.String()))
              })
            ),
            membership: Type.Optional(
              Type.Object({
                orgId: Type.UUID(),
                capability: Type.String(),
                groups: Type.Array(Type.UUID()),
                tags: Type.Optional(Type.Array(Type.String()))
              })
            )
          })
        }
      }
    },
    async (req, rep) => {
      const { code, client_id, client_secret } = req.body
      const { userId, tags } = req.verifyToken(code)
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
      const token = await rep.jwtSign(
        { userId: userId.toString(), tags: fullAccess ? undefined : scopes },
        { expiresIn: '7d' }
      )
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
  s.register(oauthDeviceRoutes, { prefix: '/device' })
})
