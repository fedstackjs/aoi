import { BSON } from 'mongodb'
import { db } from './client.js'

export interface IAnnouncement {
  _id: BSON.UUID

  title: string
  description: string
  date: string
  public: boolean
}

export const announcements = db.collection<IAnnouncement>('announcements')
await announcements.createIndex({ date: -1 })
await announcements.createIndex({ title: 1 })
