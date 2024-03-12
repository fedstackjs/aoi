import type { ProblemConfig } from '@aoi-js/common'
import type { IProblemSettings } from '@aoi-js/server'

export interface IProblemDTO {
  _id: string
  orgId: string
  accessLevel: number
  slug: string
  title: string
  description: string
  capability: string
  tags: string[]
  currentDataHash: string
  config: ProblemConfig
  settings: IProblemSettings
}
