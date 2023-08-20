export interface ISolutionDTO {
  _id: string
  state: number
  score: number
  metrics: Record<string, number>
  status: string
  message: string
  submittedAt?: number
}
