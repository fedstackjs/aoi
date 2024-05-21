import { httpErrors } from '@fastify/sensible'
import { validate } from '@lcpu/iaaa'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { FastifyRequest } from 'fastify'
import { Collection, Filter, UUID } from 'mongodb'

import { IUser } from '../db/index.js'
import { T } from '../schemas/index.js'
import { loadEnv, parseBoolean } from '../utils/index.js'

import { BaseAuthProvider } from './base.js'

const STokenPayload = T.Object({
  token: T.String()
})

const TokenPayload = TypeCompiler.Compile(STokenPayload)

export class IaaaAuthProvider extends BaseAuthProvider {
  private iaaaId = ''
  private iaaaKey = ''
  private allowSignupFromLogin = false
  private allowRebind = false

  constructor(private users: Collection<IUser>) {
    super()
  }

  override readonly name = 'iaaa'

  override async init(): Promise<void> {
    this.iaaaId = loadEnv('IAAA_ID', String)
    this.iaaaKey = loadEnv('IAAA_KEY', String)
    this.allowSignupFromLogin = loadEnv('IAAA_ALLOW_SIGNUP_FROM_LOGIN', parseBoolean, false)
    this.allowRebind = loadEnv('IAAA_ALLOW_REBIND', parseBoolean, false)

    await this.users.createIndex(
      { 'authSources.iaaaId': 1 },
      { unique: true, partialFilterExpression: { 'authSources.iaaaId': { $exists: true } } }
    )
  }

  override async bind(userId: UUID, payload: unknown, req: FastifyRequest): Promise<unknown> {
    if (!TokenPayload.Check(payload)) throw httpErrors.badRequest()
    const resp = await validate(req.ip, this.iaaaId, this.iaaaKey, payload.token)
    if (!resp.success) throw httpErrors.forbidden(resp.errMsg)
    const filter: Filter<IUser> = { _id: userId }
    if (!this.allowRebind) {
      filter['authSources.iaaaId'] = { $exists: false }
    }
    const { matchedCount } = await this.users.updateOne(filter, {
      $set: {
        'profile.realname': resp.userInfo.name,
        'profile.school': '北京大学',
        'profile.studentGrade': `${resp.userInfo.dept}${resp.userInfo.detailType}(${resp.userInfo.campus})`,
        'authSources.iaaaId': resp.userInfo.identityId,
        'authSources.iaaaInfo': resp.userInfo
      },
      $addToSet: { 'profile.verified': { $each: ['realname', 'school', 'studentGrade'] } }
    })
    if (!matchedCount) return httpErrors.badRequest('User already bound')
    return {}
  }

  override async verify(userId: UUID, payload: unknown, req: FastifyRequest): Promise<boolean> {
    if (!TokenPayload.Check(payload)) throw httpErrors.badRequest()
    const resp = await validate(req.ip, this.iaaaId, this.iaaaKey, payload.token)
    if (!resp.success) throw httpErrors.forbidden(resp.errMsg)
    const user = await this.users.findOne(
      { _id: userId },
      { projection: { 'authSources.iaaaId': 1 } }
    )
    if (!user) throw httpErrors.notFound('User not found')
    if (!user.authSources.iaaaId) throw httpErrors.forbidden('User has no IAAA ID')
    if (user.authSources.iaaaId !== resp.userInfo.identityId)
      throw httpErrors.forbidden('Invalid IAAA ID')
    return true
  }

  override async login(
    payload: unknown,
    req: FastifyRequest
  ): Promise<[userId: UUID, tags?: string[]]> {
    if (!TokenPayload.Check(payload)) throw httpErrors.badRequest()
    const resp = await validate(req.ip, this.iaaaId, this.iaaaKey, payload.token)
    if (!resp.success) throw httpErrors.forbidden(resp.errMsg)
    let userId: UUID
    const user = await this.users.findOneAndUpdate(
      { 'authSources.iaaaId': resp.userInfo.identityId },
      { $set: { 'authSources.iaaaInfo': resp.userInfo } },
      { projection: { _id: 1 } }
    )
    if (user) {
      userId = user._id
    } else {
      if (!this.allowSignupFromLogin) throw httpErrors.notFound('User not found')
      const { insertedId } = await this.users.insertOne({
        _id: new UUID(),
        profile: {
          name: resp.userInfo.identityId,
          email: `${resp.userInfo.identityId}@pku.edu.cn`,
          realname: resp.userInfo.name,
          school: '北京大学',
          studentGrade: `${resp.userInfo.dept}${resp.userInfo.detailType}(${resp.userInfo.campus})`,
          verified: ['realname', 'school', 'studentGrade']
        },
        authSources: {
          iaaaId: resp.userInfo.identityId,
          iaaaInfo: resp.userInfo
        }
      })
      userId = insertedId
    }
    return [userId]
  }
}
