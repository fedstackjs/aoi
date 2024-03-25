import { fastifySensible } from '@fastify/sensible'
import { fastify } from 'fastify'

import { authProviderPlugin } from '../auth/index.js'
import { cachePlugin } from '../cache/index.js'
import { dbPlugin, loadEnv } from '../index.js'
import { apiRoutes } from '../routes/index.js'
import { logger } from '../utils/logger.js'
import { hasModule } from '../utils/module.js'

import { schemaRoutes } from './schemas.js'

const trustProxy = loadEnv('TRUST_PROXY', JSON.parse, false)

if (trustProxy) {
  logger.warn('Trust proxy is enabled')
}

const server = fastify({
  logger,
  trustProxy
})

await server.register(fastifySensible)

await server.register(schemaRoutes, { prefix: '/schemas' })

if (hasModule('@fastify/swagger') && hasModule('@fastify/swagger-ui')) {
  logger.warn('Swagger is enabled and is not recommended for production use')
  const { default: fastifySwagger } = await import('@fastify/swagger')
  const { default: fastifySwaggerUi } = await import('@fastify/swagger-ui')

  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: '@aoi-js/server',
        description: 'API Server of the AOI Project',
        version: 'latest'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          runnerKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-AOI-Runner-Key'
          },
          runnerId: {
            type: 'apiKey',
            in: 'header',
            name: 'X-AOI-Runner-Id'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    }
  })
  await server.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  })
}

await server.register(dbPlugin)
await server.register(cachePlugin)
await server.register(authProviderPlugin)
await server.register(apiRoutes, { prefix: '/api' })

export { server }
