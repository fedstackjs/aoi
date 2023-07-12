import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

export const apiRoutes: FastifyPluginAsyncTypebox = async (srv) => {
  srv.get('/ping', async () => ({ ping: 'pong' }))
}
