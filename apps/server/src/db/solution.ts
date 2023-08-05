import { BSON } from 'mongodb'
import { db } from './client.js'

export enum SolutionState {
  CREATED = 0,
  PENDING = 1,
  QUEUED = 2,
  RUNNING = 3,
  COMPLETED = 4
}

export interface ISolution {
  _id: BSON.UUID
  orgId: BSON.UUID
  problemId: BSON.UUID
  contestId?: BSON.UUID
  userId: BSON.UUID

  label: string
  problemDataHash: string

  state: SolutionState
  solutionDataHash: string
  score: number
  metrics: Record<string, number>
  message: string
  details: string
  runnerId?: BSON.UUID
  taskId?: BSON.UUID

  createdAt: number
  submittedAt?: number
  completedAt?: number
}

export const solutions = db.collection<ISolution>('solutions')
await solutions.createIndex(
  { taskId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      taskId: { $exists: true }
    }
  }
)
