import { UUID } from 'mongodb'
import { IPrincipalControlable, IWithAccessLevel, IWithContent } from './common.js'
import { IAppSettings } from '../schemas/app.js'
import { db } from './client.js'
import { capabilityMask } from '../utils/index.js'

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

export const apps = db.collection<IApp>('apps')
await apps.createIndex({ orgId: 1, slug: 1 }, { unique: true })
await apps.createIndex({ [`associations.principalId`]: 1 })
