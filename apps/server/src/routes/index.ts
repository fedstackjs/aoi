import type { FastifyRequest } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { Type, Static } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { UUID } from 'mongodb'

import { authRoutes } from './auth/index.js'
import { userRoutes } from './user/index.js'
import { orgRoutes } from './org/index.js'
import { adminRoutes } from './admin/index.js'
import { defineRoutes } from './common/index.js'
import { problemRoutes } from './problem/index.js'
import { solutionRoutes } from './solution/index.js'
import { runnerRoutes } from './runner/index.js'
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
import { publicRoutes } from './public/index.js'
import { IOrgMembership } from '../db/index.js'
import { appRoutes } from './app/index.js'
import { oauthRoutes } from './oauth/index.js'
import { IOrgOssSettings } from '../schemas/index.js'

const SUserPayload = Type.Object({
  userId: Type.UUID(),
  tags: Type.Optional(Type.Array(Type.String()))
})
type UserPayload = Static<typeof SUserPayload>
const userPayload = TypeCompiler.Compile(SUserPayload)

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
    loadOss(orgId: UUID): Promise<IOrgOssSettings>
    verifyToken(token: string): UserPayload
    verifyMfa(token: string): string
  }
}

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
  return this.server.db.orgMemberships.findOne({ userId: this.user.userId, orgId })
}

function decoratedVerifyToken(this: FastifyRequest, token: string): UserPayload {
  const payload = this.server.jwt.verify<UserPayload>(token)
  if (userPayload.Check(payload)) return payload
  throw this.server.httpErrors.badRequest()
}

function decoratedVerifyMfa(this: FastifyRequest, token: string): string {
  if (!this.user) throw this.server.httpErrors.forbidden()
  const payload = this.verifyToken(token)
  if (!this.user.userId.equals(payload.userId)) throw this.server.httpErrors.forbidden()
  const tag = payload.tags?.find((tag) => tag.startsWith('.mfa.'))
  if (!tag) throw this.server.httpErrors.forbidden()
  const type = tag.slice(5)
  if (!Object.hasOwn(this.server.authProviders, type)) throw this.server.httpErrors.badRequest()
  return type
}

export const apiRoutes = defineRoutes(async (s) => {
  s.decorateRequest('_container', null)
  s.decorateRequest('provide', decoratedProvide)
  s.decorateRequest('inject', decoratedInject)
  s.decorateRequest('loadMembership', decoratedLoadMembership)
  s.decorateRequest('verifyToken', decoratedVerifyToken)
  s.decorateRequest('verifyMfa', decoratedVerifyMfa)

  await s.register(fastifyJwt, {
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
      // Allow type token which is a alias of bearer
      if (/^Token\s/i.test(req.headers.authorization)) {
        req.headers.authorization = req.headers.authorization.replace(/^Token\s/i, 'Bearer ')
      }
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
  s.register(appRoutes, { prefix: '/app' })
  s.register(oauthRoutes, { prefix: '/oauth' })
})
