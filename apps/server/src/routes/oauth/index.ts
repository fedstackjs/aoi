import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../common/index.js'
import { UUID } from 'mongodb'
import { apps } from '../../db/index.js'

export const oauthRoutes = defineRoutes(async (s) => {
  s.post(
    '/access_token',
    {
      schema: {
        description: 'Get access token',
        security: [],
        body: Type.Object({
          client_id: Type.String(),
          client_secret: Type.String(),
          code: Type.String()
        }),
        response: {
          200: Type.Object({
            access_token: Type.String(),
            token_type: Type.String()
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
      const app = await apps.findOne({ _id: new UUID(appId), secret: client_secret })
      if (!app) return rep.badRequest()
      const scopes = app.settings.scopes ?? ['user.details']
      const fullAccess = scopes.some((scope) => scope === '*')
      const token = await rep.jwtSign(
        { userId: userId.toString(), tags: fullAccess ? undefined : scopes },
        { expiresIn: '7d' }
      )
      return { access_token: token, token_type: 'bearer' }
    }
  )
})
