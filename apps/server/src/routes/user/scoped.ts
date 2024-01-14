import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { BSON } from 'mongodb'
import { SUserProfile, UserCapability, hasCapability, users } from '../../index.js'
import { loadUserCapability } from '../common/access.js'
import { defineInjectionPoint } from '../../utils/inject.js'
import { authProviders } from '../../auth/index.js'

const kUserContext = defineInjectionPoint<{
  _userId: BSON.UUID
}>('user')

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
    req.provide(kUserContext, {
      _userId: loadUUID(req.params, 'userId', s.httpErrors.notFound())
    })
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
        { _id: req.inject(kUserContext)._userId },
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
      const ctx = req.inject(kUserContext)
      const user = await users.findOne({ _id: ctx._userId }, { projection: { profile: 1 } })
      if (!user) return rep.notFound()
      const capability = await loadUserCapability(req)
      const allowSensitive =
        req.user.userId.equals(ctx._userId) || hasCapability(capability, UserCapability.CAP_ADMIN)
      return allowSensitive
        ? user.profile
        : {
            name: user.profile.name,
            email: user.profile.email,
            realname: user.profile.realname
          }
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
      const ctx = req.inject(kUserContext)

      const capability = await loadUserCapability(req)
      if (
        !req.user.userId.equals(ctx._userId) &&
        !hasCapability(capability, UserCapability.CAP_ADMIN)
      )
        return rep.forbidden()

      const { verified, ...rest } = req.body
      const verifiedFields = verified ?? []
      for (const field of verifiedFields) {
        ;(rest as Record<string, string | undefined>)[field] = undefined
      }

      const fields = Object.entries(rest).filter(([, v]) => v !== undefined)
      if (!fields.length) return {}

      const $set = Object.fromEntries(fields.map(([k, v]) => [`profile.${k}`, v]))
      const { matchedCount } = await users.updateOne(
        { _id: ctx._userId, [`profile.verified`]: verified },
        { $set },
        { ignoreUndefined: true }
      )
      if (!matchedCount) return rep.badRequest('Verified field cannot be changed')
      return {}
    }
  )

  s.post(
    '/preBind',
    {
      schema: {
        body: Type.Object({
          provider: Type.String(),
          payload: Type.Unknown()
        }),
        response: {
          200: Type.Unknown()
        },
        tags: ['user-auth']
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kUserContext)

      const capability = await loadUserCapability(req)
      if (
        !req.user.userId.equals(ctx._userId) &&
        !hasCapability(capability, UserCapability.CAP_ADMIN)
      )
        return rep.forbidden()

      const { provider, payload } = req.body
      const providerInstance = authProviders[provider]
      if (!providerInstance || !providerInstance.preBind) return rep.badRequest()
      return providerInstance.preBind(ctx._userId, payload)
    }
  )

  s.post(
    '/bind',
    {
      schema: {
        body: Type.Object({
          provider: Type.String(),
          payload: Type.Unknown()
        }),
        response: {
          200: Type.Unknown()
        },
        tags: ['user-auth']
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kUserContext)

      const capability = await loadUserCapability(req)
      if (
        !req.user.userId.equals(ctx._userId) &&
        !hasCapability(capability, UserCapability.CAP_ADMIN)
      )
        return rep.forbidden()

      const { provider, payload } = req.body
      const providerInstance = authProviders[provider]
      if (!providerInstance) return rep.badRequest()
      return providerInstance.bind(ctx._userId, payload)
    }
  )
})
