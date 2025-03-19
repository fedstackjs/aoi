export interface IInstanceDTO {
  _id: string
  userId: string
  problemId: string
  contestId?: string
  problemTitle: string
  contestTitle?: string
  slotNo: number
  state: InstanceState
  taskState: InstanceTaskState
  message: string
  createdAt: number
  updatedAt?: number
  allocatedAt?: number
  destroyedAt?: number
}

export enum InstanceState {
  DESTROYED = 0,
  DESTROYING = 1,
  ALLOCATED = 2,
  ALLOCATING = 3,
  ERROR = 4
}

export enum InstanceTaskState {
  PENDING = 0,
  QUEUED = 1,
  IN_PROGRESS = 2
}
