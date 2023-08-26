import { BSON } from 'mongodb'
import { db } from './client.js'

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

export const runners = db.collection<IRunner>('runners')
