import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { BSON } from 'mongodb'
import { SUserProfile, users } from '../../index.js'

declare module 'fastify' {
  interface FastifyRequest {
    _userId: BSON.UUID
  }
}

export const userScopedRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        userId: Type.String()
      })
    )
  )
  s.addHook('onRequest', async (req) => {
    req._userId = loadUUID(req.params, 'userId', s.httpErrors.notFound())
  })

  s.get(
    '/profile',
    {
      schema: {
        response: {
          200: SUserProfile
        }
      }
    },
    async (req, rep) => {
      const user = await users.findOne({ _id: req._userId }, { projection: { profile: 1 } })
      if (!user) return rep.notFound()
      return user.profile
    }
  )
})
