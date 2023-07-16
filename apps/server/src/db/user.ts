import { BSON } from 'mongodb'
import { db } from './client.js'
import { Static, Type } from '@sinclair/typebox'
import { StrictObject } from '../utils/types.js'
import { effectiveMask } from '../utils/long.js'

export const AdminCapability = {
  CAP_ACCESS: effectiveMask(0)
}

export const UserProfileSchema = StrictObject({
  username: Type.String(),
  realname: Type.String(),
  email: Type.String()
})

export interface IUserProfile extends Static<typeof UserProfileSchema> {}

export interface IUserAuthSources {
  password?: string
}

export interface IUser {
  _id: BSON.UUID

  profile: IUserProfile
  authSources: IUserAuthSources
}

export const users = db.collection<IUser>('users')
await users.createIndex({ 'profile.username': 1 }, { unique: true })
