import { Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import { problemConfigSchema } from '@aoi/common'
import {
  IProblem,
  ProblemCapability,
  problems,
  OrgCapability,
  SolutionState,
  solutions,
  problemStatuses
} from '../../db/index.js'
import {
  defineRoutes,
  loadCapability,
  loadMembership,
  loadUUID,
  paramSchemaMerger
} from '../common/index.js'
import { CAP_ALL, ensureCapability, hasCapability } from '../../utils/capability.js'
import { getUploadUrl } from '../../oss/index.js'
import { TypeUUID, StrictObject, TypeAccessLevel, TypeHash } from '../../schemas/index.js'
import { loadOrgOssSettings } from '../common/files.js'
import { solutionDataKey } from '../../oss/index.js'
import { SAPIResponseVoid } from '../../schemas/api.js'
import { attachmentRoutes } from './attachment.js'
import { dataRoutes } from './data.js'
import { solutionRoutes } from './solution.js'
import { adminRoutes } from './admin.js'

const problemIdSchema = Type.Object({
  problemId: Type.String()
})

declare module 'fastify' {
  interface FastifyRequest {
    _problemId: BSON.UUID
    _problemCapability: BSON.Long
    _problem: IProblem
  }
}

export const problemScopedRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(problemIdSchema))

  s.addHook('onRequest', async (req) => {
    const problemId = loadUUID(req.params, 'problemId', s.httpErrors.notFound())
    // TODO: optimize using projection
    const problem = await problems.findOne({ _id: problemId })
    if (!problem) throw s.httpErrors.notFound()
    const membership = await loadMembership(req.user.userId, problem.orgId)
    const capability = loadCapability(
      problem,
      membership,
      OrgCapability.CAP_PROBLEM,
      ProblemCapability.CAP_ACCESS,
      CAP_ALL
    )
    ensureCapability(capability, ProblemCapability.CAP_ACCESS, s.httpErrors.forbidden())
    req._problemId = problemId
    req._problemCapability = capability
    req._problem = problem
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get problem details',
        response: {
          200: Type.Object({
            _id: TypeUUID(),
            orgId: TypeUUID(),
            accessLevel: TypeAccessLevel(),
            slug: Type.String(),
            title: Type.String(),
            description: Type.String(),
            tags: Type.Array(Type.String()),
            capability: Type.String(),
            currentDataHash: Type.String(),
            config: Type.Optional(problemConfigSchema)
          })
        }
      }
    },
    async (req) => {
      return {
        ...req._problem,
        capability: req._problemCapability.toString(),
        config: req._problem.data.find(({ hash }) => hash === req._problem.currentDataHash)?.config
      }
    }
  )

  s.patch(
    '/content',
    {
      schema: {
        description: 'Update problem content',
        body: StrictObject({
          title: Type.String(),
          slug: Type.String(),
          description: Type.String(),
          tags: Type.Array(Type.String())
        }),
        response: {
          200: SAPIResponseVoid
        }
      }
    },
    async (req) => {
      ensureCapability(
        req._problemCapability,
        ProblemCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )
      await problems.updateOne({ _id: req._problemId }, { $set: req.body })
      return {}
    }
  )

  s.register(attachmentRoutes, { prefix: '/attachment' })
  s.register(dataRoutes, { prefix: '/data' })
  s.register(adminRoutes, { prefix: '/admin' })
  s.register(solutionRoutes, { prefix: '/solution' })

  s.post(
    '/solution',
    {
      schema: {
        description: 'Submit a solution',
        body: Type.Object({
          hash: TypeHash(),
          size: Type.Integer()
        }),
        response: {
          200: Type.Object({
            solutionId: TypeUUID(),
            uploadUrl: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const { allowPublicSubmit, maxSolutionCount } = req._problem.settings
      if (
        !allowPublicSubmit &&
        !hasCapability(req._problemCapability, ProblemCapability.CAP_SOLUTION)
      ) {
        return rep.preconditionFailed()
      }

      const oss = await loadOrgOssSettings(req._problem.orgId)
      if (!oss) return rep.preconditionFailed('OSS not configured')

      const { data, currentDataHash } = req._problem
      const currentData = data.find(({ hash }) => hash === currentDataHash)
      if (!currentData) return rep.preconditionFailed('Current data not found')
      const { config } = currentData

      const maxSize = config.solution?.maxSize ?? 1024 * 1024 * 10 // 10MiB
      if (req.body.size > maxSize) return rep.badRequest('Solution too large')

      const idOnUpsert = new BSON.UUID()
      const { value } = await solutions.findOneAndUpdate(
        { problemId: req._problemId, userId: req.user.userId, state: SolutionState.CREATED },
        {
          $set: {
            label: config.label,
            problemDataHash: currentDataHash,
            solutionDataHash: req.body.hash
          },
          $setOnInsert: {
            _id: idOnUpsert,
            orgId: req._problem.orgId,
            score: 0,
            metrics: {},
            status: '',
            message: '',
            details: '',
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
          problemId: req._problemId,
          solutionCount: upserted && maxSolutionCount ? { $lt: maxSolutionCount } : undefined
        },
        {
          $inc: upserted ? { solutionCount: 1 } : undefined,
          $set: { lastSolutionId: value._id, lastSolutionScore: 0, lastSolutionStatus: '' },
          $setOnInsert: { _id: new BSON.UUID() }
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
})
