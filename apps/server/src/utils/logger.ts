import { pino } from 'pino'

import { loadEnv } from './config.js'

export const logger = pino({
  level: loadEnv('LOG_LEVEL', String, 'info')
})
