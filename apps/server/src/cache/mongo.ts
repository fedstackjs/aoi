import { Collection, Db } from 'mongodb'

import { BaseCache } from './base.js'

export interface ICacheEntry {
  _id: string
  value: unknown
  expiresAt: Date
}

export class MongoCache extends BaseCache {
  col!: Collection<ICacheEntry>

  constructor(public db: Db) {
    super()
  }

  async init(): Promise<void> {
    this.col = this.db.collection<ICacheEntry>('cache')
    await this.col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  }

  override async set(key: string, value: string, expiresIn: number): Promise<void> {
    await this.col.updateOne(
      { _id: key },
      { $set: { value, expiresAt: new Date(Date.now() + expiresIn) } },
      { upsert: true }
    )
  }

  override async get(key: string): Promise<string | null> {
    const entry = await this.col.findOne({ _id: key })
    if (!entry || Date.now() > +entry.expiresAt) return null
    return entry.value as string
  }

  override async del(key: string): Promise<void> {
    await this.col.deleteOne({ _id: key })
  }

  override async ttl(key: string): Promise<number> {
    const entry = await this.col.findOne({ _id: key })
    if (!entry) return -2
    return Math.max(0, +entry.expiresAt - Date.now())
  }

  override async setx<T>(key: string, value: T, expiresIn: number): Promise<void> {
    await this.col.updateOne(
      { _id: key },
      { $set: { value, expiresAt: new Date(Date.now() + expiresIn) } },
      { upsert: true }
    )
  }

  override async getx<T>(key: string): Promise<T | null> {
    const entry = await this.col.findOne({ _id: key })
    if (!entry || Date.now() > +entry.expiresAt) return null
    return entry.value as T
  }

  override async clear(): Promise<void> {
    await this.col.deleteMany({})
  }
}
