import { httpErrors } from '@fastify/sensible'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as bcrypt from 'bcrypt'
import { Collection, UUID } from 'mongodb'

import { IUser } from '../db/index.js'
import { T } from '../schemas/index.js'

import { BaseAuthProvider } from './base.js'

const SPasswordBindPayload = T.Object({
  oldPassword: T.Optional(T.String()),
  password: T.String()
})

const PasswordBindPayload = TypeCompiler.Compile(SPasswordBindPayload)

const SPasswordVerifyPayload = T.Object({
  password: T.String()
})

const PasswordVerifyPayload = TypeCompiler.Compile(SPasswordVerifyPayload)

const SPasswordLoginPayload = T.Object({
  username: T.String(),
  password: T.String()
})

const PasswordLoginPayload = TypeCompiler.Compile(SPasswordLoginPayload)

export class PasswordAuthProvider extends BaseAuthProvider {
  constructor(private users: Collection<IUser>) {
    super()
  }

  override readonly name = 'password'

  override async bind(userId: UUID, payload: unknown): Promise<unknown> {
    if (!PasswordBindPayload.Check(payload)) throw new Error('invalid payload')
    if (!this.enableMfaBind) {
      const { oldPassword } = payload
      if (!oldPassword) throw httpErrors.badRequest('oldPassword is required')
      const user = await this.users.findOne(
        { _id: userId },
        { projection: { 'authSources.password': 1 } }
      )
      if (!user) throw httpErrors.notFound()
      if (!user.authSources.password) throw httpErrors.forbidden(`User has no password`)
      const match = await bcrypt.compare(oldPassword, user.authSources.password)
      if (!match) throw httpErrors.forbidden(`Invalid password`)
    }
    const { password } = payload
    const hash = await bcrypt.hash(password, 10)
    await this.users.updateOne({ _id: userId }, { $set: { 'authSources.password': hash } })
    return {}
  }

  override async verify(userId: UUID, payload: unknown): Promise<boolean> {
    if (!PasswordVerifyPayload.Check(payload)) throw new Error('invalid payload')
    const { password } = payload
    const user = await this.users.findOne(
      { _id: userId },
      { projection: { 'authSources.password': 1 } }
    )
    if (!user) throw new Error('user not found')
    if (!user.authSources.password) throw new Error('user has no password')
    return bcrypt.compare(password, user.authSources.password)
  }

  override async login(payload: unknown): Promise<[userId: UUID, tags?: string[]]> {
    if (!PasswordLoginPayload.Check(payload)) throw new Error('invalid payload')
    const { username, password } = payload
    const user = await this.users.findOne(
      { namespace: { $exists: false }, 'profile.name': username },
      { projection: { _id: 1, authSources: 1 } }
    )
    if (!user || !user.authSources.password) throw new Error('user not found')
    const match = await bcrypt.compare(password, user.authSources.password)
    if (!match) throw httpErrors.forbidden(`Invalid password`)
    return [user._id, user.authSources.passwordResetDue ? ['user-auth'] : undefined]
  }
}
