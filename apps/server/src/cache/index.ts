import { fastifyPlugin } from 'fastify-plugin'
import { BaseCache } from './base.js'
import { MongoCache } from './mongo.js'

export * from './base.js'

declare module 'fastify' {
  interface FastifyInstance {
    cache: BaseCache
  }
}

export const cachePlugin = fastifyPlugin(async (s) => {
  const cache: BaseCache = new MongoCache(s.db.db)
  await cache.init?.()
  s.decorate('cache', cache)
})
