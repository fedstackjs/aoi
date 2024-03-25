import { fastifyPlugin } from 'fastify-plugin'
import { MongoClient, Db, BSON } from 'mongodb'

import { loadEnv, logger } from '../utils/index.js'

import { dbAnnouncementPlugin } from './announcement.js'
import { dbAppPlugin } from './app.js'
import { dbContestPlugin } from './contest.js'
import { dbGroupPlugin } from './group.js'
import { dbInfoPlugin } from './info.js'
import { dbOrgPlugin } from './org.js'
import { dbPlanPlugin } from './plan.js'
import { dbProblemPlugin } from './problem.js'
import { dbPublicRanklistPlugin } from './publicRanklist.js'
import { dbRunnerPlugin } from './runner.js'
import { dbSolutionPlugin } from './solution.js'
import { dbUserPlugin } from './user.js'

export * from './app.js'
export * from './common.js'
export * from './contest.js'
export * from './group.js'
export * from './org.js'
export * from './problem.js'
export * from './runner.js'
export * from './solution.js'
export * from './user.js'
export * from './plan.js'
export * from './info.js'
export * from './announcement.js'
export * from './publicRanklist.js'

export interface IDbContainer {
  client: MongoClient
  db: Db
}

declare module 'fastify' {
  interface FastifyInstance {
    db: IDbContainer
  }
}

export const dbPlugin = fastifyPlugin(async (s) => {
  const client = new MongoClient(loadEnv('MONGO_URL', String, 'mongodb://localhost:27017'), {
    promoteLongs: false,
    pkFactory: {
      createPk: () => new BSON.UUID()
    }
  })
  await client.connect()

  s.decorate('db', {
    client,
    db: client.db()
  } as IDbContainer)

  await s.register(dbAnnouncementPlugin)
  await s.register(dbAppPlugin)
  await s.register(dbContestPlugin)
  await s.register(dbGroupPlugin)
  await s.register(dbInfoPlugin)
  await s.register(dbOrgPlugin)
  await s.register(dbPlanPlugin)
  await s.register(dbProblemPlugin)
  await s.register(dbPublicRanklistPlugin)
  await s.register(dbRunnerPlugin)
  await s.register(dbSolutionPlugin)
  await s.register(dbUserPlugin)
  logger.info('Database ready')
})
