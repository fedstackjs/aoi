import { BSON } from 'mongodb'
import { db } from './client.js'
import { IPrincipalControlable, IWithAccessLevel, IWithAttachment, IWithContent } from './common.js'
import { capabilityMask } from '../utils/capability.js'
import { ProblemConfig } from '@aoi/common'
import { IProblemSettings } from '../schemas/problem.js'

export const ProblemCapability = {
  CAP_ACCESS: capabilityMask(0), // Can access(view) this problem
  CAP_ADMIN: capabilityMask(1), // Can manage problem ACL
  CAP_SOLUTION: capabilityMask(2), // Can submit solution to this problem
  CAP_CONTENT: capabilityMask(3), // Can edit problem content
  CAP_DATA: capabilityMask(4) // Can manage problem data
}

export interface IProblemData {
  hash: string
  config: ProblemConfig
  description: string
  createdAt: number
}

export interface IProblem
  extends IPrincipalControlable,
    IWithAttachment,
    IWithAccessLevel,
    IWithContent {
  _id: BSON.UUID
  orgId: BSON.UUID

  /**
   * Data map: hash -> data
   * Stored in S3 <problemId>/data/<hash>
   */
  data: IProblemData[]
  currentDataHash: string

  settings: IProblemSettings

  createdAt: number
}

export const problems = db.collection<IProblem>('problems')
await problems.createIndex({ slug: 1 }, { unique: true })
await problems.createIndex({ [`associations.principalId`]: 1 })

export interface IProblemStatus {
  _id: BSON.UUID
  problemId: BSON.UUID
  userId: BSON.UUID
  solutionCount: number
  lastSolutionId: BSON.UUID
  lastSolutionScore: number
  lastSolutionStatus: string
}

export const problemStatuses = db.collection<IProblemStatus>('problemStatuses')
await problemStatuses.createIndex({ problemId: 1, userId: 1 }, { unique: true })
