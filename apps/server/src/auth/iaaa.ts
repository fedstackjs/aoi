import { Type } from '@sinclair/typebox'
import { loadEnv, users } from '../index.js'
import { BaseAuthProvider } from './base.js'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { UUID } from 'mongodb'
import { httpErrors } from '@fastify/sensible'
import { validate } from '@lcpu/iaaa'
import { FastifyRequest } from 'fastify'

const STokenPayload = Type.Object({
  token: Type.String()
})

const TokenPayload = TypeCompiler.Compile(STokenPayload)

export class IaaaAuthProvider extends BaseAuthProvider {
  private iaaaId = ''
  private iaaaKey = ''
  private allowSignupFromLogin = false

  constructor() {
    super()
  }

  override readonly name = 'iaaa'

  override async init(): Promise<void> {
    this.iaaaId = loadEnv('IAAA_ID', String)
    this.iaaaKey = loadEnv('IAAA_KEY', String)
    this.allowSignupFromLogin = loadEnv(
      'IAAA_ALLOW_SIGNUP_FROM_LOGIN',
      (x) => !!JSON.parse(x),
      false
    )

    await users.createIndex(
      { 'authSources.iaaaId': 1 },
      { unique: true, partialFilterExpression: { 'authSources.iaaaId': { $exists: true } } }
    )
  }

  override async bind(userId: UUID, payload: unknown, req: FastifyRequest): Promise<unknown> {
    if (!TokenPayload.Check(payload)) throw httpErrors.badRequest()
    const resp = await validate(req.ip, this.iaaaId, this.iaaaKey, payload.token)
    if (!resp.success) throw httpErrors.forbidden(resp.errMsg)
    await users.updateOne(
      { _id: userId },
      {
        $set: {
          'profile.realname': resp.userInfo.name,
          'profile.school': '北京大学',
          'profile.studentGrade': `${resp.userInfo.dept}${resp.userInfo.detailType}(${resp.userInfo.campus})`,
          'authSources.iaaaId': resp.userInfo.identityId
        },
        $addToSet: { 'profile.verified': ['realname', 'school', 'studentGrade'] }
      }
    )
    return {}
  }

  override async verify(userId: UUID, payload: unknown, req: FastifyRequest): Promise<boolean> {
    if (!TokenPayload.Check(payload)) throw httpErrors.badRequest()
    const resp = await validate(req.ip, this.iaaaId, this.iaaaKey, payload.token)
    if (!resp.success) throw httpErrors.forbidden(resp.errMsg)
    const user = await users.findOne({ _id: userId }, { projection: { 'authSources.iaaaId': 1 } })
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
    const user = await users.findOne(
      { 'authSources.iaaaId': resp.userInfo.identityId },
      { projection: { _id: 1 } }
    )
    if (user) {
      userId = user._id
    } else {
      if (!this.allowSignupFromLogin) throw httpErrors.notFound('User not found')
      const { insertedId } = await users.insertOne({
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
          iaaaId: resp.userInfo.identityId
        }
      })
      userId = insertedId
    }
    return [userId]
  }
}
