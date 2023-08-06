import { Type } from '@sinclair/typebox'
import { IRunner, runners } from '../../db/runner.js'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { randomBytes } from 'node:crypto'
import { SolutionState, solutions } from '../../db/solution.js'
import { BSON } from 'mongodb'
import { runnerTaskRoutes } from './task.js'
import { problemConfigSchema } from '@aoi/common'
import { problems } from '../../db/problem.js'
import { TypeUUID } from '../../schemas/common.js'
import { getDownloadUrl } from '../../oss/index.js'
import { problemDataKey, solutionDataKey } from '../../oss/key.js'
import { loadOrgOssSettings } from '../common/files.js'
import { packageJson } from '../../utils/package.js'

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
              taskId: TypeUUID(),
              problemConfig: problemConfigSchema,
              problemDataUrl: Type.String(),
              solutionDataUrl: Type.String()
            }),
            Type.Object({
              taskId: TypeUUID(),
              errMsg: Type.String()
            })
          ])
        }
      }
    },
    async (req) => {
      const taskId = new BSON.UUID()
      const { value: solution } = await solutions.findOneAndUpdate(
        {
          orgId: req._runner.orgId,
          state: SolutionState.PENDING,
          label: { $in: req._runner.labels }
        },
        { $set: { state: SolutionState.QUEUED, runnerId: req._runner._id, taskId } }
      )
      if (!solution) return null

      const oss = await loadOrgOssSettings(req._runner.orgId)
      if (!oss) return { taskId, errMsg: 'OSS not enabled' }
      const problem = await problems.findOne({ _id: solution.problemId })
      if (!problem) return { taskId, errMsg: 'Problem not found' }

      const currentData = problem.data[problem.currentDataHash]
      if (!currentData) return { taskId, errMsg: 'Problem data not found' }

      const problemDataUrl = await getDownloadUrl(
        oss,
        problemDataKey(problem._id, problem.currentDataHash)
      )
      const solutionDataUrl = await getDownloadUrl(oss, solutionDataKey(solution._id))

      return {
        taskId,
        problemConfig: currentData.config,
        problemDataUrl,
        solutionDataUrl
      }
    }
  )

  s.register(runnerTaskRoutes, { prefix: '/task/:solutionId/:taskId' })
})
