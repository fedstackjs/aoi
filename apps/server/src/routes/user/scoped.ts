import { Type } from '@sinclair/typebox'
import bcrypt from 'bcrypt'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { BSON } from 'mongodb'
import { SUserProfile, UserCapability, hasCapability, users } from '../../index.js'
import { loadUserCapability } from '../common/access.js'
import { defineInjectionPoint } from '../../utils/inject.js'

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

      // check validation manually
      const validation = () => {
        if (
          [req.body.telephone, req.body.school, req.body.studentGrade].some(
            (v) => !v || typeof v !== 'string'
          )
        )
          return false
        if (
          [
            req.body.name,
            req.body.realname,
            req.body.email,
            req.body.telephone,
            req.body.school,
            req.body.studentGrade
          ].some((v) => v === '')
        )
          return false
        const emailRegex = /^\S+@\S+\.\S+$/
        const telRegex = /^1[3456789]\d{9}$/
        if (!emailRegex.test(req.body.email)) return false
        if (!telRegex.test(req.body.telephone as string)) return false
        return true
      }
      if (!validation()) return rep.badRequest('Invalid profile update')

      await users.updateOne({ _id: ctx._userId }, { $set: { profile: req.body } })
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
      const ctx = req.inject(kUserContext)
      const capability = await loadUserCapability(req)
      if (
        !req.user.userId.equals(ctx._userId) &&
        !hasCapability(capability, UserCapability.CAP_ADMIN)
      )
        return rep.forbidden()

      const user = await users.findOne(
        { _id: ctx._userId },
        { projection: { 'authSources.password': 1 } }
      )
      if (!user) return rep.notFound()
      if (user.authSources.password) {
        const match = await bcrypt.compare(req.body.oldPassword, user.authSources.password)
        if (!match) return rep.forbidden()
      }

      const password = await bcrypt.hash(req.body.newPassword, 10)
      await users.updateOne({ _id: ctx._userId }, { $set: { 'authSources.password': password } })
      return {}
    }
  )
})
