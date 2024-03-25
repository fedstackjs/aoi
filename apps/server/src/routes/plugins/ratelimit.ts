import { RateLimitPluginOptions, fastifyRateLimit } from '@fastify/rate-limit'
import { fastifyPlugin } from 'fastify-plugin'

import { RedisCache } from '../../cache/redis.js'

export interface IApiRateLimitOptions extends RateLimitPluginOptions {}

export const apiRatelimitPlugin = fastifyPlugin<IApiRateLimitOptions>(async (s, options) => {
  await s.register(fastifyRateLimit, {
    max: 200,
    timeWindow: '1 minute',
    redis: s.cache instanceof RedisCache ? s.cache.redis : undefined,
    ...options
  })
})
