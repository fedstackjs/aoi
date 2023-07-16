import { UserProfileSchema, users } from '../../db/user.js'
import { defineRoutes } from '../common/index.js'

export const userRoutes = defineRoutes(async (s) => {
  s.get(
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
})