import { fastifyPlugin } from 'fastify-plugin'

import { loadEnv } from '../index.js'

import { BaseAuthProvider } from './base.js'
import { IaaaAuthProvider } from './iaaa.js'
import { MailAuthProvider } from './mail.js'
import { PasswordAuthProvider } from './password.js'
import { SMSAuthProvider } from './sms.js'

declare module 'fastify' {
  interface FastifyInstance {
    authProviders: Record<string, BaseAuthProvider>
  }
}

export const authProviderPlugin = fastifyPlugin(async (s) => {
  const enabledAuthProviders = loadEnv('AUTH_PROVIDERS', String, 'password').split(',')

  const authProviderList: Array<BaseAuthProvider> = [
    new PasswordAuthProvider(s.db.users),
    new MailAuthProvider(s.db.users, s.cache),
    new IaaaAuthProvider(s.db.users),
    new SMSAuthProvider(s.db.users, s.cache)
  ].filter((p) => enabledAuthProviders.includes(p.name))

  await Promise.all(authProviderList.map((p) => p.init?.()))

  s.decorate('authProviders', Object.fromEntries(authProviderList.map((p) => [p.name, p])))
})
