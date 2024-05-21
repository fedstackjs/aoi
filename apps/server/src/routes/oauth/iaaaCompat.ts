import { UUID } from 'mongodb'

import { T } from '../../schemas/common.js'
import { defineRoutes, md5, swaggerTagMerger } from '../common/index.js'

export const oauthIaaaCompatRoutes = defineRoutes(async (s) => {
  const { users, apps } = s.db

  s.addHook('onRoute', swaggerTagMerger('iaaa-compat'))

  if (!Object.hasOwn(s.authProviders, 'iaaa')) return

  s.get(
    '/svc/token/validate.do',
    {
      schema: {
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
      const app = await apps.findOne(
        { _id: new UUID(appId) },
        {
          projection: {
            secret: 1,
            'settings.enableIaaa': 1
          }
        }
      )
      if (!app || !app.settings.enableIaaa) {
        return {
          success: false,
          errCode: '1',
          errMsg: '未找到对应应用'
        }
      }
      const digest = md5(`appId=${appId}&remoteAddr=${remoteAddr}&token=${token}` + app.secret)
      if (digest !== msgAbs) {
        return {
          success: false,
          errCode: '2',
          errMsg: '签名错误'
        }
      }
      const user = await users.findOne(
        { _id: req.user.userId },
        { projection: { profile: 1, 'authSources.iaaaInfo': 1 } }
      )
      if (!user || !user.authSources.iaaaInfo) {
        return {
          success: false,
          errCode: '3',
          errMsg: '用户未绑定身份'
        }
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
