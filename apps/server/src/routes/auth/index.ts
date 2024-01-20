import { Type } from '@fastify/type-provider-typebox'
import bcrypt from 'bcrypt'
import { users } from '../../db/index.js'
import { BSON } from 'mongodb'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { SUserProfile } from '../../schemas/index.js'
import { infos, orgMemberships, OrgCapability } from '../../db/index.js'
import { authProviderList, authProviders } from '../../auth/index.js'
import { loadEnv } from '../../index.js'

const signupEnabled = loadEnv('SIGNUP_ENABLED', (x) => !!JSON.parse(x), true)

export const authRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', (route) => {
    ;(route.schema ??= {}).security = []
  })
  s.addHook('onRoute', swaggerTagMerger('auth'))

  s.get(
    '/login',
    {
      schema: {
        response: {
          200: Type.Object({
            providers: Type.Array(Type.String()),
            signup: Type.Boolean()
          })
        }
      }
    },
    async () => {
      return { providers: authProviderList.map((p) => p.name), signup: signupEnabled }
    }
  )

  s.post(
    '/preLogin',
    {
      schema: {
        body: Type.Object({
          provider: Type.String(),
          payload: Type.Unknown()
        }),
        response: {
          200: Type.Unknown()
        }
      }
    },
    async (req, rep) => {
      const { provider, payload } = req.body
      if (!Object.hasOwn(authProviders, provider)) return rep.badRequest()
      return authProviders[provider].preLogin?.(payload, req, rep) ?? {}
    }
  )

  s.post(
    '/login',
    {
      schema: {
        body: Type.Object({
          provider: Type.String(),
          payload: Type.Unknown()
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
      const { provider, payload } = req.body
      if (!Object.hasOwn(authProviders, provider)) return rep.badRequest()
      const [userId, tags] = await authProviders[provider].login(payload, req, rep)
      const token = await rep.jwtSign({ userId: userId.toString(), tags }, { expiresIn: '7d' })
      return { token }
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
      if (!signupEnabled) return rep.notFound()

      const { profile, password: rawPassword } = req.body
      if (!profile.telephone) return rep.badRequest('Telephone is required')
      if (!profile.school) return rep.badRequest('School is required')
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
