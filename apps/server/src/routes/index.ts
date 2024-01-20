import { authRoutes } from './auth/index.js'
import { userRoutes } from './user/index.js'
import { orgRoutes } from './org/index.js'
import { adminRoutes } from './admin/index.js'
import { defineRoutes } from './common/index.js'
import { problemRoutes } from './problem/index.js'
import { solutionRoutes } from './solution/index.js'
import { UUID } from 'mongodb'
import { runnerRoutes } from './runner/index.js'
import fastifyJwt from '@fastify/jwt'
import { Type, Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { loadEnv } from '../utils/config.js'
import { groupRoutes } from './group/index.js'
import { contestRoutes } from './contest/index.js'
import { planRoutes } from './plan/index.js'
import { infoRoutes } from './info/index.js'
import { announcementRoutes } from './announcement/index.js'
import { pubrkRoutes } from './pubrk/index.js'
import {
  IContainer,
  InjectionPoint,
  createInjectionContainer,
  inject,
  provide
} from '../utils/inject.js'
import type { FastifyRequest } from 'fastify'
import { publicRoutes } from './public/index.js'
import { IOrgMembership, orgMemberships } from '../db/index.js'
import { authProviders } from '../auth/index.js'

const SUserPayload = Type.Object({
  userId: Type.UUID(),
  tags: Type.Optional(Type.Array(Type.String())),
  mfa: Type.Optional(Type.String())
})
type UserPayload = Static<typeof SUserPayload>

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: Omit<UserPayload, 'userId'> & { userId: UUID }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    _now: number
    _container: IContainer
    provide<T>(point: InjectionPoint<T>, value: T): void
    inject<T>(point: InjectionPoint<T>): T
    loadMembership(orgId: UUID): Promise<IOrgMembership | null>
    verifyMfa(token: string): string
  }
}

const userPayload = TypeCompiler.Compile(
  Type.Object({
    userId: Type.UUID(),
    tags: Type.Optional(Type.Array(Type.String())),
    mfa: Type.Optional(Type.String())
  })
)

function decoratedProvide<T>(this: FastifyRequest, point: InjectionPoint<T>, value: T) {
  return provide(this._container, point, value)
}

function decoratedInject<T>(this: FastifyRequest, point: InjectionPoint<T>): T {
  return inject(this._container, point)
}

async function decoratedLoadMembership(
  this: FastifyRequest,
  orgId: UUID
): Promise<IOrgMembership | null> {
  if (!this.user) return null
  return orgMemberships.findOne({ userId: this.user.userId, orgId })
}

function decoratedVerifyMfa(this: FastifyRequest, token: string): string {
  if (!this.user) throw this.server.httpErrors.forbidden()
  const payload = this.server.jwt.verify<UserPayload>(token)
  if (userPayload.Check(payload)) {
    if (this.user.userId !== new UUID(payload.userId)) throw this.server.httpErrors.forbidden()
    if (!payload.mfa) throw this.server.httpErrors.forbidden()
    if (!Object.hasOwn(authProviders, payload.mfa)) throw this.server.httpErrors.badRequest()
    return payload.mfa
  }
  throw this.server.httpErrors.badRequest()
}

export const apiRoutes = defineRoutes(async (s) => {
  s.decorateRequest('_container', null)
  s.decorateRequest('provide', decoratedProvide)
  s.decorateRequest('inject', decoratedInject)
  s.decorateRequest('loadMembership', decoratedLoadMembership)
  s.decorateRequest('verifyMfa', decoratedVerifyMfa)

  s.register(fastifyJwt, {
    secret: loadEnv('JWT_SECRET', String),
    formatUser(payload) {
      if (userPayload.Check(payload)) {
        payload.userId = new UUID(payload.userId)
        return payload as Omit<UserPayload, 'userId'> & { userId: UUID }
      }
      throw s.httpErrors.badRequest()
    }
  })

  s.addHook('onRequest', async (req, rep) => {
    req._now = Date.now()
    req._container = createInjectionContainer()

    if (req.headers.authorization) {
      await req.jwtVerify()

      // Only allow tagged routes
      if (req.user.tags) {
        const tags = new Set(req.user.tags)
        if (!req.routeOptions.schema.tags?.some((tag) => tags.has(tag))) return rep.forbidden()
      }
    }

    // Check JWT
    const { security } = req.routeOptions.schema
    if (!security || security.some((sec) => Object.hasOwn(sec, 'bearerAuth'))) {
      if (!req.user) return rep.forbidden()
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
  s.register(publicRoutes, { prefix: '/public' })
})
