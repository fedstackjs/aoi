import { BaseCache } from './base.js'
import { MongoCache } from './mongo.js'

export const cache: BaseCache = new MongoCache()
await cache.init?.()
