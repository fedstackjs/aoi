import type { ProblemConfig } from '@aoi-js/common'

import type { IContestProblemSettings, IContestStage } from '@/types'

export interface IContestDTO {
  _id: string
  orgId: string
  accessLevel: number
  slug: string
  title: string
  description: string
  tags: string[]
  capability: string
  start: number
  end: number
  stages: { name: string; start: number }[]

  currentStage: IContestStage
}

export interface IContestProblemListDTO {
  _id: string
  title: string
  tags?: string[]
  settings: IContestProblemSettings
}

export interface IContestProblemDTO {
  _id: string
  title: string
  description: string
  tags?: string[]
  attachments: [
    {
      key: string
      name: string
      description: string
    }
  ]
  currentDataHash: string
  config: ProblemConfig
}

export interface IContestParticipantDTO {
  results: Record<
    string,
    {
      solutionCount: number
    }
  >
}
