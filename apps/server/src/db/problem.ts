import { BSON } from 'mongodb'
import { db } from './client.js'
import { IPrincipalControlable, IWithAccessLevel, IWithAttachment } from './common.js'
import { capabilityMask } from '../utils/capability.js'
import { ProblemConfig } from '@aoi/common'
import { IProblemSettings } from '../schemas/problem.js'

export const ProblemCapability = {
  CAP_ACCESS: capabilityMask(0), // Can access(view) this problem
  CAP_SOLUTION: capabilityMask(1), // Can submit solution to this problem
  CAP_CONTENT: capabilityMask(2), // Can edit problem content
  CAP_DATA: capabilityMask(3), // Can manage problem data
  CAP_ADMIN: capabilityMask(4) // Can manage problem ACL
}

export interface IProblemData {
  hash: string
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
  data: IProblemData[]
  currentDataHash: string

  settings: IProblemSettings

  createdAt: number
  updatedAt: number
}

export const problems = db.collection<IProblem>('problems')
await problems.createIndex({ slug: 1 }, { unique: true })
await problems.createIndex({ [`associations.principalId`]: 1 })
