import { Type } from '@sinclair/typebox'
import bcrypt from 'bcrypt'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { BSON } from 'mongodb'
import { SUserProfile, UserCapability, hasCapability, users } from '../../index.js'
import { loadUserCapability } from '../common/access.js'

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
    '/',
    {
      schema: {
        response: {
          200: Type.Object({
            profile: SUserProfile,
            capability: Type.Optional(Type.String())
          })
        }
      }
    },
    async (req, rep) => {
      const user = await users.findOne(
        { _id: req._userId },
        { projection: { profile: 1, capability: 1 } }
      )
      if (!user) return rep.notFound()
      return {
        profile: user.profile,
        capability: user.capability?.toString()
      }
    }
  )

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

  s.patch(
    '/profile',
    {
      schema: {
        body: SUserProfile
      }
    },
    async (req, rep) => {
      const capability = await loadUserCapability(req)
      if (
        !req.user.userId.equals(req._userId) &&
        !hasCapability(capability, UserCapability.CAP_ADMIN)
      )
        return rep.forbidden()

      await users.updateOne({ _id: req._userId }, { $set: { profile: req.body } })
      return {}
    }
  )

  s.patch(
    '/password',
    {
      schema: {
        body: Type.Object({
          oldPassword: Type.String(),
          newPassword: Type.String()
        })
      }
    },
    async (req, rep) => {
      const capability = await loadUserCapability(req)
      if (
        !req.user.userId.equals(req._userId) &&
        !hasCapability(capability, UserCapability.CAP_ADMIN)
      )
        return rep.forbidden()

      const user = await users.findOne(
        { _id: req._userId },
        { projection: { 'authSources.password': 1 } }
      )
      if (!user) return rep.notFound()
      if (user.authSources.password) {
        const match = await bcrypt.compare(req.body.oldPassword, user.authSources.password)
        if (!match) return rep.forbidden()
      }

      const password = await bcrypt.hash(req.body.newPassword, 10)
      await users.updateOne({ _id: req._userId }, { $set: { 'authSources.password': password } })
      return {}
    }
  )
})
