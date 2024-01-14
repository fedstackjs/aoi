import { BSON } from 'mongodb'

export abstract class BaseAuthProvider {
  constructor() {}

  abstract readonly name: string

  init?(): Promise<void>

  preBind?(userId: BSON.UUID, payload: unknown): Promise<unknown>
  abstract bind(userId: BSON.UUID, payload: unknown): Promise<unknown>

  preVerify?(userId: BSON.UUID, payload: unknown): Promise<unknown>
  abstract verify(userId: BSON.UUID, payload: unknown): Promise<boolean>

  preLogin?(payload: unknown): Promise<unknown>
  abstract login(payload: unknown): Promise<[userId: BSON.UUID, tags?: string[]]>
}
