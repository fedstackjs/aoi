import { fastifyPlugin } from 'fastify-plugin'
import { UUID, Collection } from 'mongodb'

export enum SolutionState {
  CREATED = 0,
  PENDING = 1,
  QUEUED = 2,
  RUNNING = 3,
  COMPLETED = 4
}

export interface ISolution {
  _id: UUID
  orgId: UUID
  problemId: UUID
  contestId?: UUID
  userId: UUID

  label: string
  problemDataHash: string

  state: SolutionState
  solutionDataHash: string
  score: number
  metrics: Record<string, number>
  status: string
  message: string
  runnerId?: UUID
  taskId?: UUID

  createdAt: number
  submittedAt?: number
  completedAt?: number

  preferPrivate?: boolean
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
