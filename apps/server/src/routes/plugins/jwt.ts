import fastifyJwt from '@fastify/jwt'
import { fastifyPlugin } from 'fastify-plugin'
import { UUID } from 'mongodb'
import { Static, Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'

import { loadEnv } from '../../utils/index.js'
import { FastifyRequest } from 'fastify'

const SUserPayload = Type.Object({
  userId: Type.UUID(),
  tags: Type.Optional(Type.Array(Type.String()))
})
export type UserPayload = Static<typeof SUserPayload>
const userPayload = TypeCompiler.Compile(SUserPayload)

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: Omit<UserPayload, 'userId'> & { userId: UUID }
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    verifyToken(token: string): UserPayload
  }
}

function decoratedVerifyToken(this: FastifyRequest, token: string): UserPayload {
  const payload = this.server.jwt.verify<UserPayload>(token)
  if (userPayload.Check(payload)) return payload
  throw this.server.httpErrors.badRequest()
}

export const apiJwtPlugin = fastifyPlugin(async (s) => {
  s.decorateRequest('verifyToken', decoratedVerifyToken)

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
})
