export type {
  IOrgProfile,
  IProblem,
  IOrgSettings,
  IContestStage,
  IPlanContestSettings,
  IProblemSettings,
  IPlanSettings,
  IUserProfile,
  IContestAction,
  IContestProblemSettings
} from '@aoi-js/server'

export interface IProfile {
  name: string
  email: string
}

export interface IAssociation {
  principalId: string
  capability: string
}

export interface IRunner {
  _id: string
  labels: string[]
  name: string
  createdAt: number
  accessedAt: number
}
