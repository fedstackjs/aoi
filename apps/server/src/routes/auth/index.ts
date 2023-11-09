import { Type } from '@fastify/type-provider-typebox'
import bcrypt from 'bcrypt'
import { users } from '../../db/index.js'
import { BSON } from 'mongodb'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { SUserProfile } from '../../schemas/index.js'
import { infos, orgMemberships, OrgCapability } from '../../db/index.js'

export const authRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', (route) => {
    ;(route.schema ??= {}).security = []
  })
  s.addHook('onRoute', swaggerTagMerger('auth'))

  s.post(
    '/login',
    {
      schema: {
        body: Type.Object({
          username: Type.String(),
          password: Type.String()
        }),
        response: {
          200: Type.Object({
            userId: Type.Optional(Type.String()),
            token: Type.Optional(Type.String())
          })
        }
      }
    },
    async (req, rep) => {
      const user = await users.findOne({
        'profile.name': req.body.username
      })
      if (!user?.authSources.password) {
        throw s.httpErrors.forbidden('Invalid username or password')
      }
      const match = await bcrypt.compare(req.body.password, user.authSources.password)
      if (!match) {
        throw s.httpErrors.forbidden('Invalid username or password')
      }
      if (user.authSources.passwordResetDue) {
        return { userId: user._id.toString() }
      }
      const token = await rep.jwtSign({ userId: user._id.toString() }, { expiresIn: '7d' })
      return { token }
    }
  )

  s.post(
    '/resetPassword',
    {
      schema: {
        body: Type.Object({
          userId: Type.String(),
          oldPassword: Type.String(),
          newPassword: Type.String()
        })
      }
    },
    async (req) => {
      const user = await users.findOne({
        _id: new BSON.UUID(req.body.userId)
      })
      if (!user?.authSources.password) {
        throw s.httpErrors.forbidden('Invalid username or password')
      }
      const match = await bcrypt.compare(req.body.oldPassword, user.authSources.password)
      if (!match) {
        throw s.httpErrors.forbidden('Invalid username or password')
      }
      const password = await bcrypt.hash(req.body.newPassword, 10)
      await users.updateOne(
        { _id: new BSON.UUID(req.body.userId) },
        {
          $set: {
            'authSources.password': password,
            'authSources.passwordResetDue': false
          }
        }
      )
      return 0
    }
  )

  s.post(
    '/signup',
    {
      schema: {
        body: Type.Object({
          profile: SUserProfile,
          password: Type.String()
        })
      }
    },
    async (req, rep) => {
      const { profile, password: rawPassword } = req.body
      if (!profile.telephone) return rep.badRequest('Telephone is required')
      if (!profile.studentId) return rep.badRequest('Student ID is required')
      if (!profile.studentGrade) return rep.badRequest('Student grade is required')
      const password = await bcrypt.hash(rawPassword, 10)
      if (await users.findOne({ 'profile.name': profile.name }))
        return rep.conflict('Username already exists')
      const { insertedId } = await users.insertOne({
        _id: new BSON.UUID(),
        profile,
        authSources: {
          password
        }
      })

      const info = await infos.findOne()
      const defaultOrgId = info?.regDefaultOrg ?? ''
      if (BSON.UUID.isValid(defaultOrgId)) {
        const doUUID = new BSON.UUID(defaultOrgId)
        await orgMemberships.insertOne({
          _id: new BSON.UUID(),
          userId: insertedId,
          orgId: doUUID,
          capability: OrgCapability.CAP_ACCESS,
          groups: []
        })
      }

      const token = await rep.jwtSign({ userId: insertedId.toString() }, { expiresIn: '7d' })
      return { token }
    }
  )
})
