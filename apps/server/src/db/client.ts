import { MongoClient } from 'mongodb'
import { loadEnv } from '../utils/config.js'

export const client = new MongoClient(loadEnv('MONGO_URL', String, 'mongodb://localhost:27017'), {
  promoteLongs: false
})
export const db = client.db()
