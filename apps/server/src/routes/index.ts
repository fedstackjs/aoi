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
import { groupRoutes } from './group/index.js'
import { contestRoutes } from './contest/index.js'
import { planRoutes } from './plan/index.js'
import { infoRoutes } from './info/index.js'
import { announcementRoutes } from './announcement/index.js'
import { pubrkRoutes } from './pubrk/index.js'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: { userId: BSON.UUID }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    _now: number
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
    // JWT is the default security scheme
    if ('security' in req.routeSchema) return
    try {
      await req.jwtVerify()
    } catch (err) {
      rep.send(err)
    }
    req._now = Date.now()
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
  s.register(groupRoutes, { prefix: '/group' })
  s.register(problemRoutes, { prefix: '/problem' })
  s.register(solutionRoutes, { prefix: '/solution' })
  s.register(contestRoutes, { prefix: '/contest' })
  s.register(planRoutes, { prefix: '/plan' })
  s.register(adminRoutes, { prefix: '/admin' })
  s.register(runnerRoutes, { prefix: '/runner' })
  s.register(infoRoutes, { prefix: '/info' })
  s.register(announcementRoutes, { prefix: '/announcement' })
  s.register(pubrkRoutes, { prefix: '/rk' })
})
