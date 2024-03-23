#!/usr/bin/env node
import { logger, server } from '../index.js'

const address = await server.listen({
  port: 1926,
  host: '0.0.0.0'
})

logger.fatal(`Server listening at ${address}`)
