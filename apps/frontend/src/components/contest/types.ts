import type { ProblemConfig } from '@aoi/common'

export interface IContestDTO {
  _id: string
  orgId: string
  accessLevel: number
  slug: string
  title: string
  description: string
  tags: string[]
  capability: string
  stages: [
    {
      name: string
      start: number
    }
  ]
  currentStage: {
    name: string
    start: number
    settings: {
      registrationEnabled: boolean
      registrationAllowPublic: boolean
      problemEnabled: boolean
      problemShowTags: boolean
      submitEnabled: boolean
      solutionAllowOther: boolean
      solutionAllowOtherDetails: boolean
      solutionAllowOtherDownload: boolean
    }
  }
}

export interface IContestProblemListDTO {
  _id: string
  title: string
  tags?: string[]
  settings: {
    score: number
    slug: string
  }
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
