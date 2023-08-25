export interface ISolutionDTO {
  _id: string
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
}
