import { BSON } from 'mongodb'
import { db } from './client.js'
import { IPrincipalControlable, IWithAccessLevel, IWithAttachment } from './common.js'
import { capabilityMask } from '../utils/capability.js'
import { ProblemConfig } from '@aoi/common'

export const ProblemCapability = {
  CAP_ACCESS: capabilityMask(0),
  CAP_CONTENT: capabilityMask(1),
  CAP_DATA: capabilityMask(2),
  CAP_ADMIN: capabilityMask(3)
}

export interface IProblemData {
  config: ProblemConfig
  description: string
  createdAt: number
}

export interface IProblem extends IPrincipalControlable, IWithAttachment, IWithAccessLevel {
  _id: BSON.UUID
  orgId: BSON.UUID

  slug: string
  title: string
  description: string
  tags: string[]

  /**
   * Data map: hash -> data
   * Stored in S3 <problemId>/data/<hash>
   */
  data: Record<string, IProblemData>
  currentDataHash: string

  createdAt: number
  updatedAt: number
}

export const problems = db.collection<IProblem>('problems')
await problems.createIndex({ slug: 1 }, { unique: true })
await problems.createIndex({ [`associations.principalId`]: 1 })
