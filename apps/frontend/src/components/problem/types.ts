import type { ProblemConfig } from '@aoi/common'

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
}
