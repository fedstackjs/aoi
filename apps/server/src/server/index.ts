import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import { apiRoutes } from '../routes/index.js'

const server = fastify()

await server.register(fastifySwagger)
await server.register(fastifySwaggerUi, {
  routePrefix: '/docs'
})

await server.register(apiRoutes, { prefix: '/api' })

export { server }
