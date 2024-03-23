import { fastifyPlugin } from 'fastify-plugin'
import { BSON, Collection } from 'mongodb'

export interface IRunner {
  _id: BSON.UUID
  orgId: BSON.UUID
  labels: string[]
  name: string
  key: string
  version: string
  message: string

  createdAt: number
  accessedAt: number
}

declare module './index.js' {
  interface IDbContainer {
    runners: Collection<IRunner>
  }
}

export const dbRunnerPlugin = fastifyPlugin(async (s) => {
  const col = s.db.db.collection<IRunner>('runners')
  await col.createIndex({ orgId: 1, key: 1 }, { unique: true })
  s.db.runners = col
})
