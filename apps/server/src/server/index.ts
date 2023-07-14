import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifySensible from '@fastify/sensible'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { BSON } from 'mongodb'
import { apiRoutes } from '../routes/index.js'
import { useConfig } from '../utils/config.js'

const server = fastify()

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string }
    user: { userId: BSON.UUID }
  }
}

await server.register(fastifySensible)
await server.register(fastifyJwt, {
  secret: useConfig('JWT_SECRET', 'V3ryUns3cur3S3cr3t'),
  formatUser(payload) {
    return { userId: new BSON.UUID(payload.userId) }
  }
})
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

export { server }
