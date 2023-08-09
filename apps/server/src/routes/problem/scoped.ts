import { Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import { problemConfigSchema } from '@aoi/common'
import {
  IProblem,
  ProblemCapability,
  problems,
  OrgCapability,
  SolutionState,
  solutions
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
import { manageACL } from '../common/acl.js'
import { attachmentRoutes } from './attachment.js'
import { dataRoutes } from './data.js'
import { solutionRoutes } from './solution.js'

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

const adminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    ensureCapability(req._problemCapability, ProblemCapability.CAP_ADMIN, s.httpErrors.forbidden())
  })

  s.register(manageACL, {
    collection: problems,
    resolve: async (req) => req._problemId,
    defaultCapability: ProblemCapability.CAP_ACCESS,
    prefix: '/access'
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete problem'
      }
    },
    async (req) => {
      // TODO: handle dependencies
      await problems.deleteOne({ _id: req._problemId })
      return {}
    }
  )
})

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
      const { allowPublicSubmit } = req._problem.settings
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

      const { value } = await solutions.findOneAndUpdate(
        { problemId: req._problemId, userId: req.user.userId, state: SolutionState.CREATED },
        {
          $set: {
            label: config.label,
            problemDataHash: currentDataHash,
            solutionDataHash: req.body.hash
          },
          $setOnInsert: {
            _id: new BSON.UUID(),
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
      const uploadUrl = await getUploadUrl(oss, solutionDataKey(value._id), {
        expiresIn: 300,
        size: req.body.size
      })
      return { solutionId: value._id, uploadUrl }
    }
  )
})
