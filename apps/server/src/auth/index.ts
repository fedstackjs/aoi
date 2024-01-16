import { loadEnv } from '../index.js'
import { BaseAuthProvider } from './base.js'
import { IaaaAuthProvider } from './iaaa.js'
import { MailAuthProvider } from './mail.js'
import { PasswordAuthProvider } from './password.js'

const enabledAuthProviders = loadEnv('AUTH_PROVIDERS', String, 'password').split(',')

export const authProviderList: Array<BaseAuthProvider> = [
  new PasswordAuthProvider(),
  new MailAuthProvider(),
  new IaaaAuthProvider()
].filter((p) => enabledAuthProviders.includes(p.name))

await Promise.all(authProviderList.map((p) => p.init?.()))

export const authProviders = Object.fromEntries(authProviderList.map((p) => [p.name, p]))
