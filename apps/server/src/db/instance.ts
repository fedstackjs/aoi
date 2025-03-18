import { fastifyPlugin } from 'fastify-plugin'
import { Collection, UUID } from 'mongodb'

export enum InstanceState {
  DESTROYED = 0,
  PENDING = 1,
  QUEUED = 2,
  ACTIVE = 3,
  ERROR = 4,
  PENDING_DESTROY = 5
}

export interface IInstance {
  _id: UUID
  orgId: UUID
  problemId: UUID
  contestId?: UUID
  userId: UUID
  slotNo: number

  label: string
  problemDataHash: string

  state: InstanceState
  message: string
  runnerId?: UUID
  taskId?: UUID
  createdAt: number
  activatedAt?: number
  destroyedAt?: number
}

declare module './index.js' {
  interface IDbContainer {
    instances: Collection<IInstance>
  }
}

export const dbInstancePlugin = fastifyPlugin(async (s) => {
  const col = s.db.db.collection<IInstance>('instances')
  await col.createIndex(
    { taskId: 1 },
    {
      unique: true,
      partialFilterExpression: {
        taskId: { $exists: true }
      }
    }
  )

  // Limiters
  await col.createIndex(
    { orgId: 1, userId: 1, contestId: 1, problemId: 1 },
    {
      unique: true,
      partialFilterExpression: {
        state: { $gt: InstanceState.DESTROYED }
      }
    }
  )
  await col.createIndex(
    { orgId: 1, userId: 1, contestId: 1, slotNo: 1 },
    {
      unique: true,
      partialFilterExpression: {
        state: { $gt: InstanceState.DESTROYED }
      }
    }
  )

  s.db.instances = col
})
