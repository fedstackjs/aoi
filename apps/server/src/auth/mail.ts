import mailer from 'nodemailer'

import { BaseAuthProvider } from './base.js'
import { loadEnv, logger, parseBoolean, users } from '../index.js'
import { UUID } from 'mongodb'
import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import rnd from 'randomstring'
import { cache } from '../cache/index.js'
import { httpErrors } from '@fastify/sensible'

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
  allowSignupFromLogin = false
  whitelist?: Array<string | RegExp>

  constructor() {
    super()
  }

  override readonly name = 'mail'

  override async init(): Promise<void> {
    const options = loadEnv('MAIL_OPTIONS', JSON.parse)
    this.transporter = mailer.createTransport(options)
    this.from = loadEnv('MAIL_FROM', String, '"AOI System" <aoi@fedstack.org>')
    this.html = loadEnv('MAIL_HTML', String, defaultMailHtml)
    this.allowSignupFromLogin = loadEnv('MAIL_ALLOW_SIGNUP_FROM_LOGIN', parseBoolean, false)
    const whitelist = loadEnv('MAIL_WHITELIST', JSON.parse, null)
    if (whitelist && Array.isArray(whitelist)) {
      this.whitelist = []
      for (const item of whitelist) {
        if (typeof item !== 'string') throw new Error(`Invalid email whitelist: ${item}`)
        if (item.startsWith('/')) {
          const pattern = item.slice(1, -1)
          this.whitelist.push(new RegExp(pattern))
        } else {
          this.whitelist.push(item)
        }
      }
    }

    await users.createIndex(
      { 'authSources.mail': 1 },
      { unique: true, partialFilterExpression: { 'authSources.mail': { $exists: true } } }
    )
  }

  private checkWhitelist(mail: string): boolean {
    if (!this.whitelist) return true
    const domain = mail.split('@')[1]
    for (const item of this.whitelist) {
      if (typeof item === 'string') {
        if (item === domain) return true
      } else {
        if (item.test(mail)) return true
      }
    }
    return false
  }

  private userKey(userId: UUID): string {
    return `auth:mail:${userId}`
  }

  private mailKey(mail: string): string {
    return `auth:mail:${mail}`
  }

  private async sendCode(key: string, mail: string, purpose: string) {
    if (!this.checkWhitelist(mail)) throw httpErrors.badRequest('Email address not allowed')
    const ttl = await cache.ttl(key)
    if (ttl > 0) throw httpErrors.tooManyRequests(`Wait for ${Math.ceil(ttl / 1000)} seconds`)
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
    if (!EmailPayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { email } = payload
    const key = this.userKey(userId)
    await this.sendCode(key, email, 'binding')
    return {}
  }

  override async bind(userId: UUID, payload: unknown): Promise<unknown> {
    if (!CodePayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { code } = payload
    const key = this.userKey(userId)
    const value = await cache.getx<{ code: string; mail: string }>(key)
    if (!value) throw httpErrors.forbidden('Invalid code')
    if (value.code !== code) throw httpErrors.forbidden('Invalid code')
    await cache.del(key)
    await users.updateOne(
      { _id: userId },
      {
        $set: { 'profile.email': value.mail, 'authSources.mail': value.mail },
        $addToSet: { 'profile.verified': { $each: ['email'] } }
      }
    )
    return {}
  }

  override async preVerify(userId: UUID, payload: unknown): Promise<unknown> {
    if (!EmailPayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { email } = payload
    const user = await users.findOne({ _id: userId }, { projection: { 'authSources.mail': 1 } })
    if (!user) throw httpErrors.notFound('User not found')
    if (!user.authSources.mail) throw new Error('user has no email')
    if (user.authSources.mail !== email) throw httpErrors.forbidden('Invalid email')
    const key = this.userKey(userId)
    await this.sendCode(key, user.authSources.mail, 'verification')
    return {}
  }

  override async verify(userId: UUID, payload: unknown): Promise<boolean> {
    if (!CodePayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { code } = payload
    const key = this.userKey(userId)
    const value = await cache.getx<{ code: string; mail: string }>(key)
    if (!value) throw httpErrors.forbidden('Invalid code')
    if (value.code !== code) throw httpErrors.forbidden('Invalid code')
    await cache.del(key)
    return true
  }

  override async preLogin(payload: unknown): Promise<unknown> {
    if (!EmailPayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { email } = payload
    let key = this.mailKey(email)
    if (!this.allowSignupFromLogin) {
      const user = await users.findOne({ 'authSources.mail': email }, { projection: { _id: 1 } })
      if (!user) throw httpErrors.notFound('User not found')
      key = this.userKey(user._id)
    }
    await this.sendCode(key, email, 'login')
    return {}
  }

  override async login(payload: unknown): Promise<[userId: UUID, tags?: string[]]> {
    if (!LoginPayload.Check(payload)) throw httpErrors.badRequest('Invalid payload')
    const { email, code } = payload
    if (this.allowSignupFromLogin) {
      const key = this.mailKey(email)
      const value = await cache.getx<{ code: string; mail: string }>(key)
      if (!value) throw httpErrors.forbidden('Invalid code')
      if (value.code !== code) throw httpErrors.forbidden('Invalid code')
      await cache.del(key)
      const user = await users.findOne({ 'authSources.mail': email }, { projection: { _id: 1 } })
      if (user) return [user._id]
      const { insertedId } = await users.insertOne({
        _id: new UUID(),
        profile: {
          name: email.split('@')[0],
          email,
          realname: '',
          verified: ['email']
        },
        authSources: {
          mail: email
        }
      })
      return [insertedId]
    } else {
      const user = await users.findOne({ 'authSources.mail': email }, { projection: { _id: 1 } })
      if (!user) throw httpErrors.notFound('User not found')
      const key = this.userKey(user._id)
      const value = await cache.getx<{ code: string; mail: string }>(key)
      if (!value) throw httpErrors.forbidden('Invalid code')
      if (value.code !== code) throw httpErrors.forbidden('Invalid code')
      await cache.del(key)
      return [user._id]
    }
  }
}
