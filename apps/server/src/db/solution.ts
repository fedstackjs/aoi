import { fastifyPlugin } from 'fastify-plugin'
import { BSON, Collection } from 'mongodb'

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
  status: string
  message: string
  runnerId?: BSON.UUID
  taskId?: BSON.UUID

  createdAt: number
  submittedAt?: number
  completedAt?: number
}

declare module './index.js' {
  interface IDbContainer {
    solutions: Collection<ISolution>
  }
}

export const dbSolutionPlugin = fastifyPlugin(async (s) => {
  const col = s.db.db.collection<ISolution>('solutions')
  await col.createIndex(
    { taskId: 1 },
    {
      unique: true,
      partialFilterExpression: {
        taskId: { $exists: true }
      }
    }
  )
  await col.createIndex({ problemId: 1, submittedAt: -1 })
  await col.createIndex({ contestId: 1, submittedAt: -1 })
  await col.createIndex(
    { contestId: 1, completedAt: 1, _id: 1 },
    {
      partialFilterExpression: {
        state: SolutionState.COMPLETED
      }
    }
  )
  s.db.solutions = col
})
