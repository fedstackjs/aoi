import type { ProblemConfig } from '@aoi-js/common'

export interface IContestDTO {
  _id: string
  orgId: string
  accessLevel: number
  slug: string
  title: string
  description: string
  tags: string[]
  capability: string
  stages: { name: string; start: number }[]

  currentStage: {
    name: string
    start: number
    settings: {
      registrationEnabled: boolean
      registrationAllowPublic: boolean
      problemEnabled: boolean
      problemShowTags: boolean
      solutionEnabled: boolean
      solutionAllowSubmit: boolean
      solutionShowOther: boolean
      solutionShowOtherDetails: boolean
      solutionShowOtherData: boolean
      ranklistEnabled: boolean
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

export interface IContestParticipantDTO {
  results: Record<
    string,
    {
      solutionCount: number
    }
  >
}
