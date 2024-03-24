import { BSON, Collection } from 'mongodb'
import { IUserProfile } from '../schemas/index.js'
import { capabilityMask } from '../index.js'
import { fastifyPlugin } from 'fastify-plugin'

export const USER_CAPS = {
  CAP_ADMIN: capabilityMask(0),
  CAP_CREATE_ORG: capabilityMask(1)
}

export interface IUserAuthSources {
  password?: string
  passwordResetDue?: boolean
  mail?: string
  iaaaId?: string
}

export interface IUser {
  _id: BSON.UUID

  profile: IUserProfile
  authSources: IUserAuthSources
  capability?: BSON.Long
  namespace?: string
  tags?: string[]
}

declare module './index.js' {
  interface IDbContainer {
    users: Collection<IUser>
  }
}

export const dbUserPlugin = fastifyPlugin(async (s) => {
  const col = s.db.db.collection<IUser>('users')
  await col.createIndex({ namespace: 1, 'profile.name': 1 }, { unique: true })
  s.db.users = col
})
