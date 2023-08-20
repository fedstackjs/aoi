export type {
  IOrgProfile,
  IProblem,
  IOrgSettings,
  IContestStage,
  IPlanContestSettings
} from '@aoi/server'

export interface IProfile {
  name: string
  email: string
}

export interface IAssociation {
  principleId: string
  capability: string
}

export interface IRunner {
  _id: string
  labels: string[]
  name: string
  createdAt: number
  accessedAt: number
}
