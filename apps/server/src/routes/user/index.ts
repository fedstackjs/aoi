import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { userScopedRoutes } from './scoped.js'

export const userRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('user'))
  s.register(userScopedRoutes, { prefix: '/:userId' })
})
