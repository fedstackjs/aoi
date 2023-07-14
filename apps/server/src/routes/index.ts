import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { authRoutes } from './auth/index.js'
import { userRoutes } from './user/index.js'
import { orgRoutes } from './org/index.js'

export const apiRoutes: FastifyPluginAsyncTypebox = async (srv) => {
  srv.get('/ping', async () => ({ ping: 'pong' }))
  srv.register(authRoutes, { prefix: '/auth' })
  srv.register(userRoutes, { prefix: '/user' })
  srv.register(orgRoutes, { prefix: '/org/:orgId' })
}
