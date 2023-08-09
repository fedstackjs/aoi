import { BSON } from 'mongodb'
import { db } from './client.js'
import { IUserProfile } from '../schemas/index.js'

export interface IUserAuthSources {
  password?: string
}

export interface IUser {
  _id: BSON.UUID

  profile: IUserProfile
  authSources: IUserAuthSources
}

export const users = db.collection<IUser>('users')
await users.createIndex({ 'profile.name': 1 }, { unique: true })
