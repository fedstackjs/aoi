import { fastifyPlugin } from 'fastify-plugin'
import { BSON, Collection } from 'mongodb'

export interface IAnnouncement {
  _id: BSON.UUID

  title: string
  description: string
  date: string
  public: boolean
}

declare module './index.js' {
  interface IDbContainer {
    announcements: Collection<IAnnouncement>
  }
}

export const dbAnnouncementPlugin = fastifyPlugin(async (s) => {
  const col = s.db.db.collection<IAnnouncement>('announcements')
  await col.createIndex({ date: -1 })
  await col.createIndex({ title: 1 })
  s.db.announcements = col
})
