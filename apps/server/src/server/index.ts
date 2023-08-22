import fastify from 'fastify'
import fastifySensible from '@fastify/sensible'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { apiRoutes } from '../routes/index.js'
import { logger } from '../utils/logger.js'
import { schemaRoutes } from './schemas.js'
import { loadEnv } from '../index.js'
import fastifyStatic from '@fastify/static'

const server = fastify({ logger })

await server.register(fastifySensible)

await server.register(schemaRoutes, { prefix: '/schemas' })

await server.register(fastifySwagger, {
  openapi: {
    info: {
      title: '@aoi/server',
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
          name: 'X-Runner-Key'
        },
        runnerId: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Runner-Id'
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

await server.register(apiRoutes, { prefix: '/api' })

const staticRoot = loadEnv('STATIC_ROOT', String, '')
if (staticRoot) {
  await server.register(fastifyStatic, {
    root: staticRoot
  })
  server.setNotFoundHandler((req, rep) => {
    if (req.url.startsWith('/api')) {
      return rep.notFound()
    }
    rep.sendFile('index.html')
  })
}

export { server }
