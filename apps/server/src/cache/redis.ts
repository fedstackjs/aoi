import { Redis } from 'ioredis'
import { BaseCache } from './base.js'

export class RedisCache extends BaseCache {
  redis!: Redis

  constructor(public redisUrl: string) {
    super()
  }

  async init(): Promise<void> {
    this.redis = new Redis(this.redisUrl)
  }

  async set(key: string, value: string, expiresIn: number): Promise<void> {
    await this.redis.set(key, value, 'PX', expiresIn)
  }

  async get(key: string): Promise<null | string> {
    return this.redis.get(key)
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async ttl(key: string): Promise<number> {
    return this.redis.pttl(key)
  }

  async clear(): Promise<void> {
    await this.redis.flushdb()
  }
}
