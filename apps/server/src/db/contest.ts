import { BSON } from 'mongodb'
import { capabilityMask } from '../utils/capability.js'
import { IPrincipalControlable, IWithAttachment } from './common.js'

/**
 * @see ProblemAccessLevel
 */
export enum ContestAccessLevel {
  PUBLIC = 0,
  RESTRICED = 1,
  PRIVATE = 2
}

export const ContestCapability = {
  CAP_ACCESS: capabilityMask(0),
  CAP_CONTENT: capabilityMask(1),
  CAP_DATA: capabilityMask(2),
  CAP_ADMIN: capabilityMask(3)
}

export interface IContestProblem {
  problemId: BSON.UUID
  score: number
}

export interface IContest extends IPrincipalControlable, IWithAttachment {
  _id: BSON.UUID
  orgId: BSON.UUID

  accessLevel: ContestAccessLevel
  slug: string
  title: string
  description: string
  tags: string[]

  problems: Record<string, IContestProblem>
}
