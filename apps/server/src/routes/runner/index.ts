import { Type } from '@sinclair/typebox'
import { IRunner, runners } from '../../db/index.js'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { randomBytes } from 'node:crypto'
import { runnerSolutionRoutes } from './task.js'
import { packageJson } from '../../utils/package.js'
import { runnerRanklistRoutes } from './ranklist.js'

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

  s.addHook('onRequest', async (req, rep) => {
    // Skip register route
    if (!req.routeSchema.security?.length) return
    const runnerId = loadUUID(req.headers, 'x-aoi-runner-id', s.httpErrors.unauthorized())
    const runner = await runners.findOne({ _id: runnerId })
    if (!runner) throw s.httpErrors.unauthorized()
    if (req.headers['x-aoi-runner-key'] !== runner.key) throw s.httpErrors.unauthorized()
    req._runner = runner
    rep.header('x-aoi-api-version', packageJson.version)
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
            runnerId: Type.UUID(),
            runnerKey: Type.String()
          })
        }
      }
    },
    async (req) => {
      const content = s.jwt.verify(req.body.registrationToken)
      if (!registrationPayload.Check(content)) throw s.httpErrors.badRequest()
      const orgId = loadUUID(content, 'orgId', s.httpErrors.badRequest())
      const runnerId = loadUUID(content, 'runnerId', s.httpErrors.badRequest())
      const runnerKey = randomBytes(32).toString('base64')
      await runners.insertOne({
        _id: runnerId,
        orgId,
        name: req.body.name,
        labels: req.body.labels,
        key: runnerKey,
        createdAt: Date.now(),
        accessedAt: Date.now()
      })
      return { runnerId, runnerKey }
    }
  )

  s.register(runnerRanklistRoutes, { prefix: '/ranklist' })
  s.register(runnerSolutionRoutes, { prefix: '/solution' })
})
