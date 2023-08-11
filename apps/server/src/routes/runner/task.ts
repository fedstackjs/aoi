import { Type } from '@sinclair/typebox'
import { ISolution, SolutionState, problemStatuses, solutions } from '../../db/index.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { StrictObject } from '../../index.js'

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

  s.patch(
    '/',
    {
      schema: {
        description: 'Update solution result',
        body: Type.Partial(
          StrictObject({
            status: Type.String(),
            score: Type.Number({ minimum: 0, maximum: 100 }),
            metrics: Type.Record(Type.String(), Type.Number()),
            message: Type.String(),
            details: Type.String()
          })
        ),
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      const { matchedCount } = await solutions.updateOne(
        { _id: req._solution._id, state: { $in: [SolutionState.QUEUED, SolutionState.RUNNING] } },
        { $set: { state: SolutionState.RUNNING, ...req.body } }
      )
      if (matchedCount === 0) return rep.conflict()
      if (!req._solution.contestId) {
        // update problem status
        await problemStatuses.updateOne(
          {
            userId: req._solution.userId,
            problemId: req._solution.problemId,
            lastSolutionId: req._solution._id
          },
          {
            $set: {
              lastSolutionScore: req.body.score,
              lastSolutionStatus: req.body.status
            }
          },
          { ignoreUndefined: true }
        )
      }
      return {}
    }
  )

  s.post(
    '/complete',
    {
      schema: {
        description: 'Mark solution as completed',
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      const { matchedCount } = await solutions.updateOne(
        { _id: req._solution._id, state: { $in: [SolutionState.QUEUED, SolutionState.RUNNING] } },
        { $set: { state: SolutionState.COMPLETED, completedAt: Date.now() } }
      )
      if (matchedCount === 0) return rep.conflict()
      return {}
    }
  )
})
