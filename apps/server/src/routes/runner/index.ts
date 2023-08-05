import { Type } from '@sinclair/typebox'
import { IRunner, runners } from '../../db/runner.js'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { randomBytes } from 'node:crypto'
import { SolutionState, solutions } from '../../db/solution.js'
import { BSON } from 'mongodb'
import { TypeUUID } from '../../utils/types.js'
import { runnerTaskRoutes } from './task.js'

declare module 'fastify' {
  interface FastifyRequest {
    _runner: IRunner
  }
}

const registrationPayload = TypeCompiler.Compile(
  Type.Object({
    orgId: Type.String({ format: 'uuid' }),
    runnerId: Type.String({ format: 'uuid' })
  })
)

export const runnerRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('runner'))
  s.addHook('onRoute', (route) => {
    const schema = (route.schema ??= {})
    schema.security ??= [{ runnerKeyAuth: [], runnerId: [] }]
  })

  s.addHook('onRequest', async (req) => {
    // Skip register route
    if (!req.routeSchema.security?.length) return
    const runnerId = loadUUID(req.headers, 'x-runner-id', s.httpErrors.unauthorized())
    const runner = await runners.findOne({ _id: runnerId })
    if (!runner) throw s.httpErrors.unauthorized()
    if (req.headers['x-runner-key'] !== runner.key) throw s.httpErrors.unauthorized()
    req._runner = runner
  })

  s.post(
    '/register',
    {
      schema: {
        security: [],
        description: 'Register a new runner',
        body: Type.Object({
          name: Type.String(),
          labels: Type.Array(Type.String()),
          registrationToken: Type.String()
        }),
        response: {
          200: Type.Object({
            key: Type.String()
          })
        }
      }
    },
    async (req) => {
      const content = s.jwt.verify(req.body.registrationToken)
      if (!registrationPayload.Check(content)) throw s.httpErrors.badRequest()
      const orgId = loadUUID(content, 'orgId', s.httpErrors.badRequest())
      const runnerId = loadUUID(content, 'runnerId', s.httpErrors.badRequest())
      const key = randomBytes(32).toString('base64')
      await runners.insertOne({
        _id: runnerId,
        orgId,
        name: req.body.name,
        labels: req.body.labels,
        key,
        createdAt: Date.now(),
        accessedAt: Date.now()
      })
      return { key }
    }
  )

  s.post(
    '/poll',
    {
      schema: {
        description: 'Poll for a new solution',
        response: {
          200: Type.Union([
            Type.Null(),
            Type.Object({
              taskId: TypeUUID()
            })
          ])
        }
      }
    },
    async (req) => {
      const taskId = new BSON.UUID()
      const solution = await solutions.findOneAndUpdate(
        {
          orgId: req._runner.orgId,
          state: SolutionState.PENDING,
          label: { $in: req._runner.labels }
        },
        { $set: { state: SolutionState.QUEUED, runnerId: req._runner._id, taskId } }
      )
      if (!solution.value) return null
      return {
        taskId
      }
    }
  )

  s.register(runnerTaskRoutes, { prefix: '/task/:solutionId/:taskId' })
})
