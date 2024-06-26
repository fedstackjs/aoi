export interface ISolutionDTO {
  _id: string
  problemId?: string
  problemTitle?: string
  contestId?: string
  contestTitle?: string
  userId: string
  problemDataHash: string
  label: string
  state: number
  score: number
  metrics: Record<string, number>
  status: string
  message: string
  createdAt: number
  submittedAt?: number
  completedAt?: number
  preferPrivate?: boolean
}
