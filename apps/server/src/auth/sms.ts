import { httpErrors } from '@fastify/sensible'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { Collection, UUID } from 'mongodb'

import { BaseCache } from '../cache/index.js'
import { IUser } from '../db/index.js'
import { T } from '../schemas/index.js'
import { loadEnv, logger } from '../utils/index.js'

import { BaseAuthProvider } from './base.js'

const SCodeSendPayload = T.Object({
  phone: T.String({ pattern: '^1[0-9]{10}$' }),
  token: T.String({ maxLength: 4096 })
})

const CodeSendPayload = TypeCompiler.Compile(SCodeSendPayload)

const SCodeVerifyPayload = T.Object({
  phone: T.String({ pattern: '^1[0-9]{10}$' }),
  code: T.String({ pattern: '^[0-9]{6}$' })
})

const CodeVerifyPayload = TypeCompiler.Compile(SCodeVerifyPayload)

export class SMSAuthProvider extends BaseAuthProvider {
  private _vaptchaSmsId!: string
  private _vaptchaSmsKey!: string
  private _vaptchaSmsTemplateId!: string

  constructor(
    private users: Collection<IUser>,
    private cache: BaseCache
  ) {
    super()
  }

  override readonly name = 'sms'

  override async init(): Promise<void> {
    this._vaptchaSmsId = loadEnv('VAPTCHA_SMS_ID', String)
    this._vaptchaSmsKey = loadEnv('VAPTCHA_SMS_KEY', String)
    this._vaptchaSmsTemplateId = loadEnv('VAPTCHA_SMS_TEMPLATE_ID', String)
    await this.users.createIndex(
      { 'authSources.sms': 1 },
      { unique: true, partialFilterExpression: { 'authSources.sms': { $exists: true } } }
    )
  }

  private async _sendCode(phone: string, token: string): Promise<void> {
    const resp = await fetch(`http://sms.vaptcha.com/send`, {
      headers: {
        'Content-type': "application/json;charset='utf-8'",
        Accept: 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        smsid: this._vaptchaSmsId,
        smskey: this._vaptchaSmsKey,
        templateid: this._vaptchaSmsTemplateId,
        countrycode: '86',
        token,
        data: ['_vcode'],
        phone: phone
      })
    })
    const text = await resp.text()
    logger.info(`SMS sent to ${phone}: ${text}`)
  }

  private async _verifyCode(phone: string, code: string): Promise<void> {
    const resp = await fetch(`http://sms.vaptcha.com/verify`, {
      headers: {
        'Content-type': "application/json;charset='utf-8'",
        Accept: 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        smsid: this._vaptchaSmsId,
        smskey: this._vaptchaSmsKey,
        phone,
        vcode: code
      })
    })
    const text = await resp.text()
    logger.info(`SMS verify for ${phone}: ${text}`)
    if (text !== '600') throw httpErrors.forbidden('Invalid code')
  }

  override async preBind(userId: UUID, payload: unknown): Promise<unknown> {
    if (!CodeSendPayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { phone, token } = payload
    await this._sendCode(phone, token)
    return {}
  }

  override async bind(userId: UUID, payload: unknown): Promise<unknown> {
    if (!CodeVerifyPayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { code, phone } = payload
    await this._verifyCode(phone, code)
    await this.users.updateOne(
      { _id: userId },
      {
        $set: { 'profile.telephone': phone, 'authSources.sms': phone },
        $addToSet: { 'profile.verified': { $each: ['telephone'] } }
      }
    )
    return {}
  }

  override async preVerify(userId: UUID, payload: unknown): Promise<unknown> {
    if (!CodeSendPayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { phone, token } = payload
    const user = await this.users.findOne({ _id: userId }, { projection: { 'authSources.sms': 1 } })
    if (!user) throw httpErrors.notFound('User not found')
    if (!user.authSources.sms) throw new Error('user has no binded phone')
    if (user.authSources.sms !== phone) throw httpErrors.forbidden('Invalid phone')
    await this._sendCode(phone, token)
    return {}
  }

  override async verify(userId: UUID, payload: unknown): Promise<boolean> {
    if (!CodeVerifyPayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { code, phone } = payload
    const user = await this.users.findOne({ _id: userId }, { projection: { 'authSources.sms': 1 } })
    if (!user) throw httpErrors.notFound('User not found')
    if (!user.authSources.sms) throw new Error('user has no binded phone')
    if (user.authSources.sms !== phone) throw httpErrors.forbidden('Invalid phone')
    await this._verifyCode(phone, code)
    return true
  }
}
