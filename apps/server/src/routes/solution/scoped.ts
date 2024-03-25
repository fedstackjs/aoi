import { BSON } from 'mongodb'

import { T } from '../../schemas/index.js'
import { defineInjectionPoint } from '../../utils/inject.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'

const solutionIdSchema = T.Object({
  solutionId: T.String()
})

const kSolutionContext = defineInjectionPoint<{
  _solutionId: BSON.UUID
}>('solution')

export const solutionScopedRoute = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(solutionIdSchema))

  // TODO: Access Control
  s.addHook('onRequest', async (req) => {
    req.provide(kSolutionContext, {
      _solutionId: loadUUID(req.params, 'solutionId', s.httpErrors.notFound())
    })
  })
})
