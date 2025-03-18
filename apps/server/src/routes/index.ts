import type { FastifyRequest } from 'fastify'
import { UUID } from 'mongodb'

import { IOrgMembership } from '../db/index.js'
import { IOrgOssSettings } from '../schemas/index.js'
import { IContainer, InjectionPoint, inject, provide, logger, loadEnv } from '../utils/index.js'

import { adminRoutes } from './admin/index.js'
import { announcementRoutes } from './announcement/index.js'
import { appRoutes } from './app/index.js'
import { authRoutes } from './auth/index.js'
import { defineRoutes } from './common/index.js'
import { contestRoutes } from './contest/index.js'
import { groupRoutes } from './group/index.js'
import { infoRoutes } from './info/index.js'
import { instanceRoutes } from './instance/index.js'
import { oauthRoutes } from './oauth/index.js'
import { orgRoutes } from './org/index.js'
import { planRoutes } from './plan/index.js'
import {
  apiAuthPlugin,
  apiHealthPlugin,
  apiInjectPlugin,
  apiRatelimitPlugin,
  apiUserAuthPlugin
} from './plugins/index.js'
import { problemRoutes } from './problem/index.js'
import { publicRoutes } from './public/index.js'
import { pubrkRoutes } from './pubrk/index.js'
import { runnerRoutes } from './runner/index.js'
import { solutionRoutes } from './solution/index.js'
import { userRoutes } from './user/index.js'

declare module 'fastify' {
  interface FastifyRequest {
    _now: number
    _container: IContainer
    provide<T>(point: InjectionPoint<T>, value: T): void
    inject<T>(point: InjectionPoint<T>): T
    loadMembership(orgId: UUID): Promise<IOrgMembership | null>
    loadOss(orgId: UUID): Promise<IOrgOssSettings>
    verifyMfa(token: string): Promise<string>
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

async function decoratedVerifyMfa(this: FastifyRequest, token: string): Promise<string> {
  if (!this.user) throw this.server.httpErrors.forbidden()
  const payload = await this.verifyToken(token)
  if (!this.user.userId.equals(payload.userId)) throw this.server.httpErrors.forbidden()
  const tag = payload.tags?.find((tag) => tag.startsWith('.mfa.'))
  if (!tag) throw this.server.httpErrors.forbidden()
  const type = tag.slice(5)
  if (!Object.hasOwn(this.server.authProviders, type)) throw this.server.httpErrors.badRequest()
  return type
}

export const apiRoutes = defineRoutes(async (s) => {
  s.decorateRequest('_container')
  s.decorateRequest('provide', decoratedProvide)
  s.decorateRequest('inject', decoratedInject)
  s.decorateRequest('loadMembership', decoratedLoadMembership)
  s.decorateRequest('verifyMfa', decoratedVerifyMfa)

  await s.register(apiInjectPlugin)
  await s.register(apiHealthPlugin)
  await s.register(apiAuthPlugin)

  s.register(async (s) => {
    // User routes
    await s.register(apiUserAuthPlugin)
    await s.register(apiRatelimitPlugin, {
      nameSpace: 'rate-user-',
      keyGenerator: (req) => (req.user ? req.user.userId.toString() : req.ip),
      max: loadEnv('RATELIMIT_USER', Number, 500),
      timeWindow: '1 minute'
    })

    s.register(authRoutes, { prefix: '/auth' })
    s.register(oauthRoutes, { prefix: '/oauth' })
    s.register(userRoutes, { prefix: '/user' })
    s.register(orgRoutes, { prefix: '/org' })
    s.register(groupRoutes, { prefix: '/group' })
    s.register(problemRoutes, { prefix: '/problem' })
    s.register(solutionRoutes, { prefix: '/solution' })
    s.register(contestRoutes, { prefix: '/contest' })
    s.register(planRoutes, { prefix: '/plan' })
    s.register(adminRoutes, { prefix: '/admin' })
    s.register(infoRoutes, { prefix: '/info' })
    s.register(announcementRoutes, { prefix: '/announcement' })
    s.register(pubrkRoutes, { prefix: '/rk' })
    s.register(publicRoutes, { prefix: '/public' })
    s.register(appRoutes, { prefix: '/app' })
    s.register(instanceRoutes, { prefix: '/instance' })
  })

  s.register(async (s) => {
    // Runner routes
    await s.register(apiRatelimitPlugin, {
      nameSpace: 'rate-runner-',
      max: loadEnv('RATELIMIT_RUNNER', Number, 5000),
      timeWindow: '1 minute'
    })

    s.register(runnerRoutes, { prefix: '/runner' })
  })

  logger.info('API routes ready')
})
