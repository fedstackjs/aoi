import { ProblemConfig } from '@aoi-js/common'
import { fastifyPlugin } from 'fastify-plugin'
import { BSON, Collection } from 'mongodb'

import { IProblemSettings } from '../schemas/problem.js'
import { capabilityMask } from '../utils/capability.js'

import { IPrincipalControlable, IWithAccessLevel, IWithAttachment, IWithContent } from './common.js'

export const PROBLEM_CAPS = {
  CAP_ACCESS: capabilityMask(0), // Can access(view) this problem
  CAP_ADMIN: capabilityMask(1), // Can manage problem ACL
  CAP_SOLUTION: capabilityMask(2), // Can submit solution to this problem
  CAP_CONTENT: capabilityMask(3), // Can edit problem content
  CAP_DATA: capabilityMask(4) // Can manage problem data
}

export interface IProblemStatus {
  _id: BSON.UUID
  problemId: BSON.UUID
  userId: BSON.UUID
  solutionCount: number
  lastSolutionId: BSON.UUID
  lastSolutionScore: number
  lastSolutionStatus: string
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

declare module './index.js' {
  interface IDbContainer {
    problems: Collection<IProblem>
    problemStatuses: Collection<IProblemStatus>
  }
}

export const dbProblemPlugin = fastifyPlugin(async (s) => {
  const problems = s.db.db.collection<IProblem>('problems')
  await problems.createIndex({ orgId: 1, slug: 1 }, { unique: true })
  await problems.createIndex({ orgId: 1, tags: 1 })
  await problems.createIndex({ [`associations.principalId`]: 1 })
  s.db.problems = problems

  const problemStatuses = s.db.db.collection<IProblemStatus>('problemStatuses')
  await problemStatuses.createIndex({ problemId: 1, userId: 1 }, { unique: true })
  s.db.problemStatuses = problemStatuses
})
