export abstract class BaseCache {
  constructor() {}

  init?(): Promise<void>

  abstract set(key: string, value: string, expiresIn: number): Promise<void>
  abstract get(key: string): Promise<null | string>
  abstract del(key: string): Promise<void>
  abstract ttl(key: string): Promise<number>
  abstract clear(): Promise<void>

  async gete(key: string): Promise<string> {
    const value = await this.get(key)
    if (value === null) throw new Error('not found')
    return value
  }

  setx<T>(key: string, value: T, expiresIn: number): Promise<void> {
    return this.set(key, JSON.stringify(value), expiresIn)
  }

  async getx<T>(key: string): Promise<T | null> {
    const value = await this.get(key)
    if (value === null) return null
    return JSON.parse(value) as T
  }

  async getex<T>(key: string): Promise<T> {
    const value = await this.getx<T>(key)
    if (value === null) throw new Error('not found')
    return value
  }
}
