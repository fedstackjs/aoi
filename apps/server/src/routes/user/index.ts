import { defineRoutes } from '../common/index.js'
import { userScopedRoutes } from './scoped.js'

export const userRoutes = defineRoutes(async (s) => {
  s.register(userScopedRoutes, { prefix: '/:userId' })
})
