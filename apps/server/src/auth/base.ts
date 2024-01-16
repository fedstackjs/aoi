import { FastifyReply, FastifyRequest } from 'fastify'
import { BSON } from 'mongodb'

export abstract class BaseAuthProvider {
  constructor() {}

  abstract readonly name: string

  init?(): Promise<void>

  preBind?(
    userId: BSON.UUID,
    payload: unknown,
    req: FastifyRequest,
    rep: FastifyReply
  ): Promise<unknown>
  abstract bind(
    userId: BSON.UUID,
    payload: unknown,
    req: FastifyRequest,
    rep: FastifyReply
  ): Promise<unknown>

  preVerify?(
    userId: BSON.UUID,
    payload: unknown,
    req: FastifyRequest,
    rep: FastifyReply
  ): Promise<unknown>
  abstract verify(
    userId: BSON.UUID,
    payload: unknown,
    req: FastifyRequest,
    rep: FastifyReply
  ): Promise<boolean>

  preLogin?(payload: unknown, req: FastifyRequest, rep: FastifyReply): Promise<unknown>
  abstract login(
    payload: unknown,
    req: FastifyRequest,
    rep: FastifyReply
  ): Promise<[userId: BSON.UUID, tags?: string[]]>
}
