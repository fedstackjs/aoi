import { server } from './server/index.js'
import { logger } from './utils/logger.js'

const address = await server.listen({
  port: 1926,
  host: '0.0.0.0'
})

logger.fatal(`Server listening at ${address}`)
