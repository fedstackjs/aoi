import { BSON, Collection } from 'mongodb'
import { capabilityMask } from '../utils/capability.js'
import { IGroupProfile } from '../schemas/index.js'
import { fastifyPlugin } from 'fastify-plugin'

export const GROUP_CAPS = {
  CAP_ACCESS: capabilityMask(0)
}

export interface IGroup {
  _id: BSON.UUID

  orgId: BSON.UUID
  profile: IGroupProfile
}

declare module './index.js' {
  interface IDbContainer {
    groups: Collection<IGroup>
  }
}

export const dbGroupPlugin = fastifyPlugin(async (s) => {
  const col = s.db.db.collection<IGroup>('groups')
  await col.createIndex({ orgId: 1 })
  await col.createIndex({ orgId: 1, [`profile.name`]: 1 }, { unique: true })
  s.db.groups = col
})
