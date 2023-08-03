import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { solutionScopedRoute } from './scoped.js'

export const solutionRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('solution'))

  s.register(solutionScopedRoute, { prefix: '/:solutionId' })
})
