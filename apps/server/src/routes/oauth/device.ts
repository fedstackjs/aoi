import rnd from 'randomstring'
import { fastifyRateLimit } from '@fastify/rate-limit'
import { Type } from '@sinclair/typebox'
import { UUID } from 'mongodb'

import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { loadEnv } from '../../utils/index.js'

const DEVICE_VERIFICATION_URI = loadEnv(
  'DEVICE_VERIFICATION_URI',
  String,
  'web+aoi://authorize/device'
)
const EXPIRES_IN_SEC = 900

export const oauthDeviceRoutes = defineRoutes(async (s) => {
  const { apps } = s.db
  const cache = s.cache

  s.addHook('onRoute', swaggerTagMerger('oauth.device'))

  await s.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute'
  })

  s.post(
    '/login',
    {
      schema: {
        security: [],
        body: Type.Object({
          appId: Type.String()
        }),
        response: {
          200: Type.Object({
            secret: Type.String(),
            verificationUri: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const app = await apps.findOne({ _id: new UUID(req.body.appId) })
      if (!app || !app.settings.allowDeviceFlow) return rep.notFound()

      const secret = rnd.generate({ length: 40, charset: 'alphanumeric' })
      await cache.setx(
        `device_flow:${secret}`,
        { appId: req.body.appId, code: '' },
        EXPIRES_IN_SEC * 1000
      )
      return {
        secret,
        verificationUri: `${DEVICE_VERIFICATION_URI}?secret=${secret}&appId=${req.body.appId}`
      }
    }
  )

  s.post(
    '/code',
    {
      schema: {
        security: [],
        body: Type.Object({
          appId: Type.String(),
          secret: Type.String()
        }),
        response: {
          200: Type.Object({
            code: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const { appId, secret } = req.body
      const entry = await cache.getx<{ appId: string; code: string }>(`device_flow:${secret}`)
      if (!entry || entry.appId !== appId) return rep.notFound()
      if (entry.code) await cache.del(`device_flow:${secret}`)
      return { code: entry.code }
    }
  )

  s.post(
    '/authorize',
    {
      schema: {
        body: Type.Object({
          appId: Type.String(),
          secret: Type.String(),
          code: Type.String()
        })
      }
    },
    async (req, rep) => {
      const { appId, secret, code } = req.body
      const entry = await cache.getx<{ appId: string; code: string }>(`device_flow:${secret}`)
      if (!entry || entry.appId !== appId) return rep.notFound()
      await cache.setx(`device_flow:${secret}`, { appId, code }, EXPIRES_IN_SEC * 1000)
      return 0
    }
  )
})
