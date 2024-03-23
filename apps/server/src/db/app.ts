import { Collection, UUID } from 'mongodb'
import { IPrincipalControlable, IWithAccessLevel, IWithContent } from './common.js'
import { IAppSettings } from '../schemas/app.js'
import { capabilityMask } from '../utils/index.js'
import { fastifyPlugin } from 'fastify-plugin'

export const APP_CAPS = {
  CAP_ACCESS: capabilityMask(0),
  CAP_ADMIN: capabilityMask(1),
  CAP_CONTENT: capabilityMask(2),
  CAP_LOGIN: capabilityMask(3)
}

export interface IApp extends IPrincipalControlable, IWithAccessLevel, IWithContent {
  _id: UUID
  orgId: UUID

  settings: IAppSettings

  secret: string

  createdAt: number
}

declare module './index.js' {
  interface IDbContainer {
    apps: Collection<IApp>
  }
}

export const dbAppPlugin = fastifyPlugin(async (s) => {
  const col = s.db.db.collection<IApp>('apps')
  await col.createIndex({ orgId: 1, slug: 1 }, { unique: true })
  await col.createIndex({ [`associations.principalId`]: 1 })
  s.db.apps = col
})
