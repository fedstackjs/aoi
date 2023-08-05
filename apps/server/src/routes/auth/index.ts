import { Type } from '@fastify/type-provider-typebox'
import bcrypt from 'bcrypt'
import { UserProfileSchema, users } from '../../db/user.js'
import { StrictObject } from '../../utils/types.js'
import { BSON } from 'mongodb'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'

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
            token: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const user = await users.findOne({
        'profile.username': req.body.username
      })
      if (!user?.authSources.password) {
        throw s.httpErrors.forbidden('Invalid username or password')
      }
      const match = await bcrypt.compare(req.body.password, user.authSources.password)
      if (!match) {
        throw s.httpErrors.forbidden('Invalid username or password')
      }
      const token = await rep.jwtSign({ userId: user._id.toString() }, { expiresIn: '15d' })
      return { token }
    }
  )

  s.post(
    '/signup',
    {
      schema: {
        body: StrictObject({
          profile: UserProfileSchema,
          password: Type.String()
        })
      }
    },
    async (req, rep) => {
      const { profile, password: rawPassword } = req.body
      const password = await bcrypt.hash(rawPassword, 10)
      const { insertedId } = await users.insertOne({
        _id: new BSON.UUID(),
        profile,
        authSources: {
          password
        }
      })
      const token = await rep.jwtSign({ userId: insertedId.toString() }, { expiresIn: '15d' })
      return { token }
    }
  )
})
