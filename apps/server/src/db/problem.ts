import { BSON } from 'mongodb'
import { db } from './client.js'
import { IPrincipalControlable } from './common.js'

export interface IProblem extends IPrincipalControlable {
  _id: BSON.UUID
  orgId: BSON.UUID
  slug: string
  title: string
  description: string
  createdAt: number
  updatedAt: number
}

export const problems = db.collection<IProblem>('problems')
await problems.createIndex({ slug: 1 }, { unique: true })
await problems.createIndex({ [`associations.principalId`]: 1 })
