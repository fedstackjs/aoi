import mailer from 'nodemailer'

import { BaseAuthProvider } from './base.js'
import { loadEnv, logger, users } from '../index.js'
import { UUID } from 'mongodb'
import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import rnd from 'randomstring'
import { cache } from '../cache/index.js'

const SEmailPayload = Type.Object({
  email: Type.String({ pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$' })
})

const EmailPayload = TypeCompiler.Compile(SEmailPayload)

const SCodePayload = Type.Object({
  code: Type.String({ pattern: '^[0-9]{6}$' })
})

const CodePayload = TypeCompiler.Compile(SCodePayload)

const SLoginPayload = Type.Object({
  email: Type.String({ pattern: '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$' }),
  code: Type.String({ pattern: '^[0-9]{6}$' })
})

const LoginPayload = TypeCompiler.Compile(SLoginPayload)

const defaultMailHtml = `
This is a verification email for <b>{{PURPOSE}}</b> and your verification code is <code>{{CODE}}</code>.
`

export class MailAuthProvider extends BaseAuthProvider {
  transporter!: mailer.Transporter
  from!: string
  html!: string

  constructor() {
    super()
  }

  override readonly name = 'mail'

  override async init(): Promise<void> {
    const options = loadEnv('MAIL_OPTIONS', JSON.parse)
    this.transporter = mailer.createTransport(options)
    this.from = loadEnv('MAIL_FROM', String, '"AOI System" <aoi@fedstack.org>')
    this.html = loadEnv('MAIL_HTML', String, defaultMailHtml)
    await users.createIndex(
      { 'profile.email': 1 },
      { unique: true, partialFilterExpression: { 'profile.verified': 'email' } }
    )
  }

  private async sendCode(userId: UUID, mail: string, purpose: string) {
    const key = `auth:mail:${userId}`
    const ttl = await cache.ttl(key)
    if (ttl > 0) throw new Error('too frequent')
    const code = rnd.generate({ length: 6, charset: 'numeric' })
    await cache.setx(key, { code, mail }, 5 * 60 * 1000)
    const info = await this.transporter.sendMail({
      from: this.from,
      to: mail,
      subject: 'Verification code',
      html: this.html.replace('{{PURPOSE}}', purpose).replace('{{CODE}}', code)
    })
    logger.info(info, `sent verification code to ${mail} for ${purpose}`)
  }

  override async preBind(userId: UUID, payload: unknown): Promise<unknown> {
    if (!EmailPayload.Check(payload)) throw new Error('invalid payload')
    const { email } = payload
    await this.sendCode(userId, email, 'binding')
    return {}
  }

  override async bind(userId: UUID, payload: unknown): Promise<unknown> {
    if (!CodePayload.Check(payload)) throw new Error('invalid payload')
    const { code } = payload
    const key = `auth:mail:${userId}`
    const value = await cache.getx<{ code: string; mail: string }>(key)
    if (!value) throw new Error('invalid code')
    if (value.code !== code) throw new Error('invalid code')
    await users.updateOne(
      { _id: userId },
      { $set: { 'profile.email': value.mail }, $addToSet: { 'profile.verified': ['email'] } }
    )
    return {}
  }

  override async preVerify(userId: UUID): Promise<unknown> {
    const user = await users.findOne({ _id: userId }, { projection: { 'profile.email': 1 } })
    if (!user) throw new Error('user not found')
    if (!user.profile.email) throw new Error('user has no email')
    await this.sendCode(userId, user.profile.email, 'verification')
    return {}
  }

  override async verify(userId: UUID, payload: unknown): Promise<boolean> {
    if (!CodePayload.Check(payload)) throw new Error('invalid payload')
    const { code } = payload
    const key = `auth:mail:${userId}`
    const value = await cache.getx<{ code: string; mail: string }>(key)
    if (!value) throw new Error('invalid code')
    if (value.code !== code) throw new Error('invalid code')
    return true
  }

  override async preLogin(payload: unknown): Promise<unknown> {
    if (!EmailPayload.Check(payload)) throw new Error('invalid payload')
    const { email } = payload
    const user = await users.findOne(
      { 'profile.email': email, 'profile.verified': 'email' },
      { projection: { _id: 1 } }
    )
    if (!user) throw new Error('user not found')
    await this.sendCode(user._id, email, 'login')
    return {}
  }

  override async login(payload: unknown): Promise<[userId: UUID, tags?: string[]]> {
    if (!LoginPayload.Check(payload)) throw new Error('invalid payload')
    const { email, code } = payload
    const user = await users.findOne(
      { 'profile.email': email, 'profile.verified': 'email' },
      { projection: { _id: 1 } }
    )
    if (!user) throw new Error('user not found')
    const key = `auth:mail:${user._id}`
    const value = await cache.getx<{ code: string; mail: string }>(key)
    if (!value) throw new Error('invalid code')
    if (value.code !== code) throw new Error('invalid code')
    return [user._id]
  }
}
