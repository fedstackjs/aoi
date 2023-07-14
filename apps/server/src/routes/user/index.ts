import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { UserProfileSchema, users } from '../../db/user.js'

export const userRoutes: FastifyPluginAsyncTypebox = async (srv) => {
  srv.addHook('onRequest', async (req, rep) => {
    try {
      await req.jwtVerify()
    } catch (err) {
      rep.send(err)
    }
  })

  srv.get(
    '/profile',
    {
      schema: {
        response: {
          200: UserProfileSchema
        }
      }
    },
    async (req) => {
      const user = await users.findOne({ _id: req.user.userId }, { projection: { profile: 1 } })
      return user?.profile
    }
  )
}
