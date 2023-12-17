export interface IPlanDTO {
  _id: string
  orgId: string
  accessLevel: number
  slug: string
  title: string
  description: string
  tags: string[]
  capability: string
}

export interface IPlanContestDTO {
  _id: string
  title: string
  slug: string
  tags: string[]
  settings: unknown
}
