import { UUID } from 'mongodb'
import { BaseAuthProvider } from './base.js'
import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import bcrypt from 'bcrypt'
import { users } from '../index.js'

const SPasswordBindPayload = Type.Object({
  oldPassword: Type.String(),
  password: Type.String()
})

const PasswordBindPayload = TypeCompiler.Compile(SPasswordBindPayload)

const SPasswordVerifyPayload = Type.Object({
  password: Type.String()
})

const PasswordVerifyPayload = TypeCompiler.Compile(SPasswordVerifyPayload)

const SPasswordLoginPayload = Type.Object({
  username: Type.String(),
  password: Type.String()
})

const PasswordLoginPayload = TypeCompiler.Compile(SPasswordLoginPayload)

export class PasswordAuthProvider extends BaseAuthProvider {
  constructor() {
    super()
  }

  override readonly name = 'password'

  override async bind(userId: UUID, payload: unknown): Promise<unknown> {
    if (!PasswordBindPayload.Check(payload)) throw new Error('invalid payload')
    const { oldPassword, password } = payload
    const user = await users.findOne({ _id: userId }, { projection: { 'authSources.password': 1 } })
    if (!user) throw new Error('user not found')
    if (user.authSources.password && !bcrypt.compare(oldPassword, user.authSources.password))
      throw new Error('invalid password')
    const hash = await bcrypt.hash(password, 10)
    await users.updateOne({ _id: userId }, { $set: { 'authSources.password': hash } })
    return {}
  }

  override async verify(userId: UUID, payload: unknown): Promise<boolean> {
    if (!PasswordVerifyPayload.Check(payload)) throw new Error('invalid payload')
    const { password } = payload
    const user = await users.findOne({ _id: userId }, { projection: { 'authSources.password': 1 } })
    if (!user) throw new Error('user not found')
    if (!user.authSources.password) throw new Error('user has no password')
    return bcrypt.compare(password, user.authSources.password)
  }

  override async login(payload: unknown): Promise<[userId: UUID, tags?: string[]]> {
    if (!PasswordLoginPayload.Check(payload)) throw new Error('invalid payload')
    const { username, password } = payload
    const user = await users.findOne(
      { 'profile.name': username },
      { projection: { _id: 1, authSources: 1 } }
    )
    if (!user || !user.authSources.password) throw new Error('user not found')
    if (!bcrypt.compare(password, user.authSources.password)) throw new Error('invalid password')
    return [user._id, user.authSources.passwordResetDue ? ['user-auth'] : undefined]
  }
}