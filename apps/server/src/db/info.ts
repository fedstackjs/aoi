import { fastifyPlugin } from 'fastify-plugin'
import { BSON, Collection } from 'mongodb'

export interface IInfoMilestone {
  csp: string
  noip: string
}

export interface IInfoFriend {
  title: string
  url: string
}

export interface IInfoPoster {
  title: string
  url: string
}

export interface IInfo {
  _id: BSON.UUID

  milestone: IInfoMilestone
  friends: IInfoFriend[]
  posters: IInfoPoster[]

  regDefaultOrg?: string
}

declare module './index.js' {
  interface IDbContainer {
    infos: Collection<IInfo>
  }
}

export const dbInfoPlugin = fastifyPlugin(async (s) => {
  const infos = s.db.db.collection<IInfo>('info')
  // initialize
  const count = await infos.countDocuments()
  if (count === 0) {
    // insert one if none exists
    await infos.insertOne({
      _id: new BSON.UUID(),
      milestone: {
        csp: '2024-12-02',
        noip: '2024-12-02'
      },
      friends: [],
      posters: []
    })
  }
  s.db.infos = infos
})
