import { BSON } from 'mongodb'
import { db } from './client.js'

export interface IPublicRanklist {
  ranklistId: number
  orgId: BSON.UUID
  contestId: BSON.UUID
  ranklistKey: string
  visible: boolean
}

export const pubrk = db.collection<IPublicRanklist>('pubrk')
await pubrk.createIndex({ ranklistId: -1 }, { unique: true })
