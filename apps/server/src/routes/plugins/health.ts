import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

export const apiHealthPlugin: FastifyPluginAsyncTypebox = async (s) => {
  s.get(
    '/ping',
    {
      schema: {
        description: 'Server health check',
        security: []
      }
    },
    async () => ({ ping: 'pong' })
  )
}
