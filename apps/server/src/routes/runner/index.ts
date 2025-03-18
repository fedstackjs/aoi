import { randomBytes } from 'node:crypto'

import { TypeCompiler } from '@sinclair/typebox/compiler'
import { FastifyRequest } from 'fastify'

import { IRunner } from '../../db/index.js'
import { logger } from '../../index.js'
import { T } from '../../schemas/index.js'
import { packageJson } from '../../utils/package.js'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'

import { kRunnerContext } from './inject.js'
import { runnerInstanceRoutes } from './instance.js'
import { runnerRanklistRoutes } from './ranklist.js'
import { runnerSolutionRoutes } from './solution.js'

const registrationPayload = TypeCompiler.Compile(
  T.Object({
    orgId: T.String({ format: 'uuid' }),
    runnerId: T.String({ format: 'uuid' })
  })
)

const RELATIME_DELAY = 60 * 1000 // 1 minute

function updateAccessedAt(req: FastifyRequest, runner: IRunner) {
  const now = Date.now()
  if (runner.accessedAt < now - RELATIME_DELAY) {
    req.server.db.runners
      .updateOne(
        { _id: runner._id },
        {
          $set: {
            accessedAt: now,
            version: req.headers['user-agent'],
            ip: req.ip
          }
        },
        { ignoreUndefined: true }
      )
      .catch((err) => {
        logger.error(err)
      })
  }
}

export const runnerRoutes = defineRoutes(async (s) => {
  const { runners } = s.db

  s.addHook('onRoute', swaggerTagMerger('runner'))
  s.addHook('onRoute', (route) => {
    const schema = (route.schema ??= {})
    schema.security ??= [{ runnerKeyAuth: [], runnerId: [] }]
  })

  s.addHook('onRequest', async (req, rep) => {
    // Skip register route
    if (!req.routeOptions.schema?.security?.length) return
    const runnerId = loadUUID(req.headers, 'x-aoi-runner-id', s.httpErrors.unauthorized())
    const runner = await runners.findOne({ _id: runnerId })
    if (!runner) throw s.httpErrors.unauthorized()
    if (req.headers['x-aoi-runner-key'] !== runner.key) throw s.httpErrors.unauthorized()
    req.provide(kRunnerContext, {
      _runner: runner
    })
    rep.header('x-aoi-api-version', packageJson.version)
    updateAccessedAt(req, runner)
  })

  s.post(
    '/register',
    {
      schema: {
        security: [],
        description: 'Register a new runner',
        body: T.Object({
          name: T.String(),
          labels: T.Array(T.String()),
          version: T.String(),
          registrationToken: T.String()
        }),
        response: {
          200: T.Object({
            runnerId: T.UUID(),
            runnerKey: T.String()
          })
        }
      }
    },
    async (req) => {
      const content = await req.verify(req.body.registrationToken)
      if (!registrationPayload.Check(content)) throw s.httpErrors.badRequest()
      const orgId = loadUUID(content, 'orgId', s.httpErrors.badRequest())
      const runnerId = loadUUID(content, 'runnerId', s.httpErrors.badRequest())
      const runnerKey = randomBytes(32).toString('base64')
      await runners.insertOne({
        _id: runnerId,
        orgId,
        name: req.body.name,
        labels: req.body.labels,
        version: req.body.version,
        message: '',
        ip: req.ip,
        key: runnerKey,
        createdAt: Date.now(),
        accessedAt: Date.now()
      })
      return { runnerId, runnerKey }
    }
  )

  s.post(
    '/ping',
    {
      schema: {
        body: T.Partial(
          T.StrictObject({
            message: T.String()
          })
        )
      }
    },
    async (req) => {
      await runners.updateOne(
        { _id: req.inject(kRunnerContext)._runner._id },
        {
          $set: {
            version: req.headers['user-agent'],
            message: req.body.message,
            ip: req.ip
          }
        }
      )
      return {}
    }
  )

  s.register(runnerRanklistRoutes, { prefix: '/ranklist' })
  s.register(runnerSolutionRoutes, { prefix: '/solution' })
  s.register(runnerInstanceRoutes, { prefix: '/instance' })
})
