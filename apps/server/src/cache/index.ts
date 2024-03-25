import { fastifyPlugin } from 'fastify-plugin'

import { loadEnv, logger } from '../utils/index.js'

import { BaseCache } from './base.js'
import { MongoCache } from './mongo.js'
import { RedisCache } from './redis.js'

export * from './base.js'

declare module 'fastify' {
  interface FastifyInstance {
    cache: BaseCache
  }
}

export const cachePlugin = fastifyPlugin(async (s) => {
  const url = loadEnv('REDIS_URL', String, '')
  let cache: BaseCache
  if (url) {
    cache = new RedisCache(url)
  } else {
    cache = new MongoCache(s.db.db)
    logger.warn('Using MongoDB cache')
  }
  await cache.init?.()
  s.decorate('cache', cache)
  logger.info('Cache ready')
})
