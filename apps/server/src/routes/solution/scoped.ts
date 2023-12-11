import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { BSON } from 'mongodb'
import { defineInjectionPoint } from '../../utils/inject.js'

const solutionIdSchema = Type.Object({
  solutionId: Type.String()
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
