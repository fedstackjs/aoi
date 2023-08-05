import { authRoutes } from './auth/index.js'
import { userRoutes } from './user/index.js'
import { orgRoutes } from './org/index.js'
import { adminRoutes } from './admin/index.js'
import { defineRoutes } from './common/index.js'
import { problemRoutes } from './problem/index.js'
import { solutionRoutes } from './solution/index.js'
import { BSON } from 'mongodb'
import { runnerRoutes } from './runner/index.js'
import fastifyJwt from '@fastify/jwt'
import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { loadEnv } from '../utils/config.js'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { userId: BSON.UUID }
  }
}

const userPayload = TypeCompiler.Compile(
  Type.Object({
    userId: Type.String()
  })
)

export const apiRoutes = defineRoutes(async (s) => {
  s.register(fastifyJwt, {
    secret: loadEnv('JWT_SECRET', String),
    formatUser(payload) {
      if (userPayload.Check(payload)) {
        return { userId: new BSON.UUID(payload.userId) }
      }
      throw s.httpErrors.badRequest()
    }
  })

  s.addHook('onRequest', async (req, rep) => {
    if (Array.isArray(req.routeSchema.security) && !req.routeSchema.security.length) return
    try {
      await req.jwtVerify()
    } catch (err) {
      rep.send(err)
    }
  })

  s.get(
    '/ping',
    {
      schema: {
        description: 'Server health check',
        security: []
      }
    },
    async () => ({ ping: 'pong' })
  )
  s.register(authRoutes, { prefix: '/auth' })
  s.register(userRoutes, { prefix: '/user' })
  s.register(orgRoutes, { prefix: '/org' })
  s.register(problemRoutes, { prefix: '/problem' })
  s.register(solutionRoutes, { prefix: '/solution' })
  s.register(adminRoutes, { prefix: '/admin' })
  s.register(runnerRoutes, { prefix: '/runner' })
})
