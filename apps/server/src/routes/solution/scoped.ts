import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { BSON } from 'mongodb'

const solutionIdSchema = Type.Object({
  solutionId: Type.String()
})

declare module 'fastify' {
  interface FastifyRequest {
    _solutionId: BSON.UUID
  }
}

export const solutionScopedRoute = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(solutionIdSchema))

  // TODO: Access Control
  s.addHook('onRequest', async (req) => {
    req._solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.notFound())
  })
})
