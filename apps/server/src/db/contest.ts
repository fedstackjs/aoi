import { BSON } from 'mongodb'
import { capabilityMask } from '../utils/capability.js'
import { IPrincipalControlable, IWithAccessLevel, IWithAttachment } from './common.js'
import { db } from './client.js'
import {
  IContestProblemSettings,
  IContestRanklistSettings,
  IContestStage
} from '../schemas/contest.js'

export const ContestCapability = {
  CAP_ACCESS: capabilityMask(0),
  CAP_CONTENT: capabilityMask(1),
  CAP_DATA: capabilityMask(2),
  CAP_ADMIN: capabilityMask(3)
}

export interface IContestParticipantResult {
  solutionCount: number
}

export interface IContestParticipant {
  _id: BSON.UUID
  userId: BSON.UUID
  contestId: BSON.UUID
  results: Record<string, IContestParticipantResult>
}

export const contestParticipants = db.collection<IContestParticipant>('contestParticipants')
await contestParticipants.createIndex({ userId: 1, contestId: 1 }, { unique: true })

export interface IContestProblem {
  problemId: BSON.UUID
  settings: IContestProblemSettings
}

export enum ContestRanklistState {
  VALID = 0,
  PENDING = 1,
  INVALID = 2
}

export interface IContestRanklist {
  key: string
  name: string
  settings: IContestRanklistSettings
}

export interface IContest extends IPrincipalControlable, IWithAttachment, IWithAccessLevel {
  _id: BSON.UUID
  orgId: BSON.UUID

  slug: string
  title: string
  description: string
  tags: string[]

  problems: IContestProblem[]
  stages: IContestStage[]

  ranklists: IContestRanklist[]
  ranklistLastSolutionId?: BSON.UUID
  ranklistState: ContestRanklistState
  ranklistRunnerId?: BSON.UUID
  ranklistTaskId?: BSON.UUID
}

export const contests = db.collection<IContest>('contests')
