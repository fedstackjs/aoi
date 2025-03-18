export interface IInstanceDTO {
  _id: string
  userId: string
  problemId: string
  contestId?: string
  problemTitle: string
  contestTitle?: string
  slotNo: number
  state: InstanceState
  message: string
  createdAt: number
  activatedAt?: number
  destroyedAt?: number
}

export enum InstanceState {
  DESTROYED = 0,
  PENDING = 1,
  QUEUED = 2,
  ACTIVE = 3
}
