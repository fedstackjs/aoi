import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { BSON } from 'mongodb'
import { SolutionState, solutions } from '../../db/solution.js'
import { TypeUUID } from '../../schemas/common.js'

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

  s.get(
    '/',
    {
      schema: {
        description: 'Get solution details',
        response: {
          200: Type.Object({
            _id: TypeUUID(),
            problemId: TypeUUID(),
            contestId: Type.Optional(TypeUUID()),
            userId: TypeUUID(),
            label: Type.String(),
            problemDataHash: Type.String(),
            state: Type.Integer(),
            solutionDataHash: Type.String(),
            score: Type.Number(),
            metrics: Type.Record(Type.String(), Type.Number()),
            status: Type.String(),
            message: Type.String(),
            details: Type.String(),
            taskId: Type.Optional(TypeUUID()),
            createdAt: Type.Integer(),
            submittedAt: Type.Optional(Type.Integer()),
            completedAt: Type.Optional(Type.Integer())
          })
        }
      }
    },
    async (req) => {
      const solution = await solutions.findOne({ _id: req._solutionId })
      if (!solution) throw s.httpErrors.notFound()
      return solution
    }
  )

  s.post(
    '/submit',
    {
      schema: {
        description: 'Submit solution'
      }
    },
    async (req) => {
      const { modifiedCount } = await solutions.updateOne(
        { _id: req._solutionId, userId: req.user.userId, state: SolutionState.CREATED },
        { $set: { state: SolutionState.PENDING } }
      )
      if (modifiedCount === 0) throw s.httpErrors.notFound()
      return 0
    }
  )

  s.get(
    '/download',
    {
      schema: {
        description: 'Download solution data'
      }
    },
    async () => {
      //
    }
  )
})
