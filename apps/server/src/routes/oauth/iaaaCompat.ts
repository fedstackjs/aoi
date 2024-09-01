import { fastifyFormbody } from '@fastify/formbody'
import { UUID } from 'mongodb'

import { T } from '../../schemas/common.js'
import { defineRoutes, md5, swaggerTagMerger } from '../common/index.js'

export const oauthIaaaCompatRoutes = defineRoutes(async (s) => {
  await s.register(fastifyFormbody)

  const { users, apps } = s.db

  s.addHook('onRoute', swaggerTagMerger('iaaa-compat'))

  if (!Object.hasOwn(s.authProviders, 'iaaa')) return

  s.get(
    '/oauth.jsp',
    {
      schema: {
        body: T.Object({
          appID: T.String(),
          appName: T.String(),
          redirectUrl: T.String()
        })
      }
    },
    async (req, rep) => {
      const url = new URL('/oauth/authorize', req.originalUrl)
      url.searchParams.set('client_id', req.body.appID)
      url.searchParams.set('redirect_uri', req.body.redirectUrl)
      return rep.redirect(307, url.toString())
    }
  )

  s.get(
    '/svc/token/validate.do',
    {
      schema: {
        description: 'See IAAA Guide V2.1 section 3.4.1 for details',
        security: [],
        querystring: T.Object({
          remoteAddr: T.String({ maxLength: 45 }),
          appId: T.UUID(),
          token: T.String(),
          msgAbs: T.String()
        }),
        response: {
          200: T.Object({
            success: T.Boolean(),
            errCode: T.String(),
            errMsg: T.String(),
            userInfo: T.Optional(
              T.Object({
                name: T.String(),
                status: T.String(),
                identityId: T.String(),
                deptId: T.String(),
                dept: T.String(),
                identityType: T.String(),
                detailType: T.String(),
                identityStatus: T.String(),
                campus: T.String()
              })
            )
          })
        }
      }
    },
    async (req) => {
      const { remoteAddr, appId, token, msgAbs } = req.query
      const { userId, tags } = req.verifyToken(token)
      const tag = tags?.find((tag) => tag.startsWith(`.oauth.access_token.`))
      if (!tag || appId !== tag.slice(20) || !UUID.isValid(appId)) {
        return { success: false, errCode: '1', errMsg: '无效的appId' }
      }

      const app = await apps.findOne(
        { _id: new UUID(appId) },
        { projection: { secret: 1, 'settings.enableIaaa': 1 } }
      )
      if (!app || !app.settings.enableIaaa) {
        return { success: false, errCode: '1', errMsg: '未找到对应应用' }
      }

      const digest = md5(`appId=${appId}&remoteAddr=${remoteAddr}&token=${token}` + app.secret)
      if (digest !== msgAbs) {
        return { success: false, errCode: '1', errMsg: '签名错误' }
      }

      const user = await users.findOne(
        { _id: new UUID(userId) },
        { projection: { profile: 1, 'authSources.iaaaInfo': 1 } }
      )
      if (!user || !user.authSources.iaaaInfo) {
        return { success: false, errCode: '3', errMsg: '用户未绑定身份' }
      }

      return {
        success: true,
        errCode: '0',
        errMsg: '认证成功',
        userInfo: user.authSources.iaaaInfo
      }
    }
  )
})
