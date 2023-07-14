import { client } from './db/client.js'
import { logger } from './utils/logger.js'
import { server } from './server/index.js'

await client.connect()
const address = await server.listen({
  port: 1926,
  host: '0.0.0.0'
})

logger.fatal(`Server listening at ${address}`)
