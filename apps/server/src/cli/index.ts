#!/usr/bin/env node
import { client, logger, server } from '../index.js'

await client.connect()
const address = await server.listen({
  port: 1926,
  host: '0.0.0.0'
})

logger.fatal(`Server listening at ${address}`)
