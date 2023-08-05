import { Type } from '@sinclair/typebox'
import { ISolution, solutions } from '../../db/solution.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'

declare module 'fastify' {
  interface FastifyRequest {
    _solution: ISolution
  }
}

export const runnerTaskRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        solutionId: Type.String({ format: 'uuid' }),
        taskId: Type.String({ format: 'uuid' })
      })
    )
  )

  s.addHook('onRequest', async (req) => {
    const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.notFound())
    const taskId = loadUUID(req.params, 'taskId', s.httpErrors.notFound())
    const solution = await solutions.findOne({ _id: solutionId, runnerId: req._runner._id, taskId })
    if (!solution) throw s.httpErrors.notFound()
    req._solution = solution
  })
})
