import { SProblemConfigSchema } from '@aoi-js/common'
import { BSON } from 'mongodb'

import { PROBLEM_CAPS, ORG_CAPS, SolutionState } from '../../db/index.js'
import { getUploadUrl, solutionDataKey } from '../../oss/index.js'
import { T, SProblemSettings } from '../../schemas/index.js'
import { CAP_ALL, ensureCapability, hasCapability } from '../../utils/capability.js'
import { manageContent } from '../common/content.js'
import { defineRoutes, loadCapability, loadUUID, paramSchemaMerger } from '../common/index.js'

import { problemAdminRoutes } from './admin.js'
import { problemAttachmentRoutes } from './attachment.js'
import { problemDataRoutes } from './data.js'
import { kProblemContext } from './inject.js'
import { problemSolutionRoutes } from './solution.js'

const problemIdSchema = T.Object({
  problemId: T.String()
})

export const problemScopedRoutes = defineRoutes(async (s) => {
  const { problems, solutions, problemStatuses, orgs } = s.db

  s.addHook('onRoute', paramSchemaMerger(problemIdSchema))

  s.addHook('onRequest', async (req) => {
    const problemId = loadUUID(req.params, 'problemId', s.httpErrors.notFound())
    // TODO: optimize using projection
    const problem = await problems.findOne({ _id: problemId })
    if (!problem) throw s.httpErrors.notFound()
    const membership = await req.loadMembership(problem.orgId)
    const capability = loadCapability(
      problem,
      membership,
      ORG_CAPS.CAP_PROBLEM,
      PROBLEM_CAPS.CAP_ACCESS,
      CAP_ALL
    )
    ensureCapability(capability, PROBLEM_CAPS.CAP_ACCESS, s.httpErrors.forbidden())
    req.provide(kProblemContext, {
      _problemId: problemId,
      _problemCapability: capability,
      _problem: problem
    })
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get problem details',
        response: {
          200: T.Object({
            _id: T.UUID(),
            orgId: T.UUID(),
            accessLevel: T.AccessLevel(),
            slug: T.String(),
            title: T.String(),
            description: T.String(),
            tags: T.Array(T.String()),
            capability: T.String(),
            currentDataHash: T.String(),
            config: T.Optional(SProblemConfigSchema),
            settings: SProblemSettings
          })
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kProblemContext)

      return {
        ...ctx._problem,
        capability: ctx._problemCapability.toString(),
        config: ctx._problem.data.find(({ hash }) => hash === ctx._problem.currentDataHash)?.config
      }
    }
  )

  s.post(
    '/solution',
    {
      schema: {
        description: 'Submit a solution',
        body: T.Object({
          hash: T.Hash(),
          size: T.Integer()
        }),
        response: {
          200: T.Object({
            solutionId: T.UUID(),
            uploadUrl: T.String()
          })
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kProblemContext)

      const { allowPublicSubmit, maxSolutionCount } = ctx._problem.settings
      if (!allowPublicSubmit && !hasCapability(ctx._problemCapability, PROBLEM_CAPS.CAP_SOLUTION)) {
        return rep.preconditionFailed()
      }

      const org = await orgs.findOne(
        { _id: ctx._problem.orgId },
        { projection: { 'settings.oss': 1 } }
      )
      const oss = org?.settings.oss
      if (!oss) return rep.preconditionFailed('OSS not configured')

      const { data, currentDataHash } = ctx._problem
      const currentData = data.find(({ hash }) => hash === currentDataHash)
      if (!currentData) return rep.preconditionFailed('Current data not found')
      const { config } = currentData

      const maxSize = config.solution?.maxSize ?? 1024 * 1024 * 10 // 10MiB
      if (req.body.size > maxSize) return rep.badRequest('Solution too large')

      const idOnUpsert = new BSON.UUID()
      const value = await solutions.findOneAndUpdate(
        { problemId: ctx._problemId, userId: req.user.userId, state: SolutionState.CREATED },
        {
          $set: {
            label: config.label,
            problemDataHash: currentDataHash,
            solutionDataHash: req.body.hash
          },
          $setOnInsert: {
            _id: idOnUpsert,
            orgId: ctx._problem.orgId,
            score: 0,
            metrics: {},
            status: '',
            message: '',
            createdAt: Date.now()
          }
        },
        { upsert: true, returnDocument: 'after' }
      )

      if (!value) throw s.httpErrors.conflict()

      const upserted = value._id.equals(idOnUpsert)
      await problemStatuses.updateOne(
        {
          userId: req.user.userId,
          problemId: ctx._problemId,
          solutionCount: upserted && maxSolutionCount ? { $lt: maxSolutionCount } : undefined
        },
        {
          $inc: { solutionCount: upserted ? 1 : undefined },
          $set: { lastSolutionId: value._id, lastSolutionScore: 0, lastSolutionStatus: '' },
          $setOnInsert: { _id: new BSON.UUID(), solutionCount: upserted ? undefined : 0 }
        },
        { upsert: true, ignoreUndefined: true }
      )

      const uploadUrl = await getUploadUrl(oss, solutionDataKey(value._id), {
        expiresIn: 300,
        size: req.body.size
      })
      return { solutionId: value._id, uploadUrl }
    }
  )

  s.register(manageContent, {
    collection: problems,
    resolve: async (req) => {
      const ctx = req.inject(kProblemContext)

      if (!hasCapability(ctx._problemCapability, PROBLEM_CAPS.CAP_CONTENT)) return null
      return ctx._problemId
    },
    prefix: '/content'
  })

  s.register(problemAttachmentRoutes, { prefix: '/attachment' })
  s.register(problemDataRoutes, { prefix: '/data' })
  s.register(problemAdminRoutes, { prefix: '/admin' })
  s.register(problemSolutionRoutes, { prefix: '/solution' })
})
