import { BSON } from 'mongodb'
import { capabilityMask } from '../utils/capability.js'
import { IPrincipalControlable, IWithAccessLevel, IWithAttachment, IWithContent } from './common.js'
import { db } from './client.js'
import {
  IContestProblemSettings,
  IContestRanklistSettings,
  IContestStage
} from '../schemas/contest.js'
import { ISolution } from './solution.js'
import { IUser } from './user.js'
import { IUserProfile } from '../index.js'

export const CONTEST_CAPS = {
  CAP_ACCESS: capabilityMask(0),
  CAP_ADMIN: capabilityMask(1),
  CAP_CONTENT: capabilityMask(2),
  CAP_REGISTRATION: capabilityMask(3)
}

export interface IContestParticipantResult {
  solutionCount: number
  lastSolutionId: BSON.UUID
  lastSolution: Pick<ISolution, 'score' | 'status'> & { completedAt: number }
}

export interface IContestParticipant {
  _id: BSON.UUID
  userId: BSON.UUID
  contestId: BSON.UUID
  results: Record<string, IContestParticipantResult>
  createdAt: number
  updatedAt: number
  tags?: string[]
}

export const contestParticipants = db.collection<IContestParticipant>('contestParticipants')
await contestParticipants.createIndex({ userId: 1, contestId: 1 }, { unique: true })
await contestParticipants.createIndex({ contestId: 1, updatedAt: 1, _id: 1 })

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

export interface IContest
  extends IPrincipalControlable,
    IWithAttachment,
    IWithAccessLevel,
    IWithContent {
  _id: BSON.UUID
  orgId: BSON.UUID

  problems: IContestProblem[]
  stages: IContestStage[]
  start: number
  end: number

  ranklists: IContestRanklist[]
  ranklistState: ContestRanklistState
  ranklistUpdatedAt: number
  ranklistRunnerId?: BSON.UUID
  ranklistTaskId?: BSON.UUID

  participantCount: number
}

export const contests = db.collection<IContest>('contests')
await contests.createIndex({ orgId: 1, slug: 1 }, { unique: true })
await contests.createIndex({ orgId: 1, tags: 1 })
await contests.createIndex({ [`associations.principalId`]: 1 })

export function getCurrentContestStage(now: number, { stages }: IContest) {
  for (let i = stages.length - 1; i >= 0; i--) {
    if (stages[i].start <= now) return stages[i]
  }
  return stages[0]
}

export async function evalTagRules(
  stage: IContestStage,
  user: IUser
): Promise<string[] | undefined> {
  if (!stage.settings.tagRules) return undefined
  const tags: string[] = []
  const rules = stage.settings.tagRules
  if (rules.copyVerifiedFields && user.profile.verified) {
    const { verified } = user.profile
    const fields = rules.copyVerifiedFields
      .split(',')
      .filter((field): field is keyof IUserProfile => verified.includes(field))
      .map((field) => `${user.profile[field]}`)
    tags.push(...fields)
  }
  return tags
}
