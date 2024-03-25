import type { IPlan, IPlanContest } from '@aoi-js/server'

import type { MapEntity } from '@/types/server'

export interface IPlanDTO extends MapEntity<IPlan> {
  capability: string
}

export interface IPlanContestDTO extends Pick<MapEntity<IPlanContest>, 'settings'> {
  _id: string
  title: string
  slug: string
  description: string
  tags: string[]
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
      solutionShowDetails: boolean
      solutionShowOtherDetails: boolean
      solutionShowOtherData: boolean
      ranklistEnabled: boolean
      participantEnabled: boolean
    }
  }
}
