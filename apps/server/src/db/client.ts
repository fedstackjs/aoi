import { MongoClient } from 'mongodb'
import { useConfig } from '../utils/config.js'

export const client = new MongoClient(useConfig('MONGO_URL', 'mongodb://localhost:27017'))
export const db = client.db()
