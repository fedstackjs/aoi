import { Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import { problemConfigSchema } from '@aoi/common'
import { IProblem, ProblemCapability, problems } from '../../db/problem.js'
import {
  defineRoutes,
  loadCapability,
  loadMembership,
  loadUUID,
  paramSchemaMerger
} from '../common/index.js'
import { CAP_ALL, ensureCapability } from '../../utils/capability.js'
import { OrgCapability } from '../../db/org.js'
import { getUploadUrl } from '../../oss/index.js'
import { SolutionState, solutions } from '../../db/solution.js'
import { TypeUUID, StrictObject, TypeAccessLevel } from '../../schemas/common.js'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { problemAttachmentKey, problemDataKey, solutionDataKey } from '../../oss/key.js'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

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
            accessLevel: TypeAccessLevel(),
            slug: Type.String(),
            title: Type.String(),
            description: Type.String(),
            attachments: Type.Record(
              Type.String(),
              Type.Object({
                name: Type.String(),
                description: Type.String()
              })
            ),
            config: problemConfigSchema
          })
        }
      }
    },
    async (req) => {
      return {
        ...req._problem,
        config: req._problem.data[req._problem.currentDataHash]?.config ?? ''
      }
    }
  )

  s.register(
    async (s) => {
      s.addHook('onRoute', paramSchemaMerger(Type.Object({ key: Type.String() })))
      s.register(getFileUrl, {
        prefix: '/url',
        resolve: async (type, _query, req) => {
          if (type !== 'download') {
            ensureCapability(
              req._problemCapability,
              ProblemCapability.CAP_CONTENT,
              s.httpErrors.forbidden()
            )
          }
          const oss = await loadOrgOssSettings(req._problem.orgId)
          return [oss, problemAttachmentKey(req._problemId, (req.params as { key: string }).key)]
        }
      })

      s.put(
        '/',
        {
          schema: {
            description: 'Upsert problem attachment',
            body: StrictObject({
              name: Type.String(),
              description: Type.String()
            }),
            response: {
              200: Type.Object({})
            }
          }
        },
        async (req) => {
          ensureCapability(
            req._problemCapability,
            ProblemCapability.CAP_CONTENT,
            s.httpErrors.forbidden()
          )

          const key = (req.params as { key: string }).key
          await problems.updateOne(
            { _id: req._problemId },
            { $set: { [`attachments.${key}`]: req.body } }
          )
          return {}
        }
      )

      s.delete(
        '/',
        {
          schema: {
            description: 'Delete problem attachment',
            response: {
              200: Type.Object({})
            }
          }
        },
        async (req) => {
          ensureCapability(
            req._problemCapability,
            ProblemCapability.CAP_CONTENT,
            s.httpErrors.forbidden()
          )

          const key = (req.params as { key: string }).key
          await problems.updateOne(
            { _id: req._problemId },
            { $unset: { [`attachments.${key}`]: 1 } }
          )
          return {}
        }
      )
    },
    { prefix: '/attachment/:key' }
  )
  s.register(
    (async (s) => {
      s.addHook('onRoute', paramSchemaMerger(Type.Object({ hash: Type.String() })))
      s.register(getFileUrl, {
        prefix: '/url',
        resolve: async (_type, _query, req) => {
          ensureCapability(
            req._problemCapability,
            ProblemCapability.CAP_CONTENT,
            s.httpErrors.forbidden()
          )
          const oss = await loadOrgOssSettings(req._problem.orgId)
          const hash = (req.params as { hash: string }).hash
          return [oss, problemDataKey(req._problemId, hash), { sha256: hash, expiresIn: 300 }]
        }
      })

      s.put(
        '/',
        {
          schema: {
            description: 'Upsert problem data',
            body: StrictObject({
              size: Type.Integer({ minimum: 0 }),
              config: problemConfigSchema,
              description: Type.String()
            }),
            response: {
              200: Type.Object({})
            }
          }
        },
        async (req, rep) => {
          ensureCapability(
            req._problemCapability,
            ProblemCapability.CAP_CONTENT,
            s.httpErrors.forbidden()
          )
          const oss = await loadOrgOssSettings(req._problem.orgId)
          if (!oss) return rep.preconditionFailed('OSS not configured')

          const hash = (req.params as { hash: string }).hash
          const { config, description } = req.body
          const { modifiedCount } = await problems.updateOne(
            { _id: req._problemId },
            { $set: { [`data.${hash}`]: { createdAt: Date.now(), config, description } } }
          )
          if (!modifiedCount) return rep.conflict()
          return {}
        }
      )

      s.delete(
        '/',
        {
          schema: {
            description: 'Delete problem attachment',
            response: {
              200: Type.Object({})
            }
          }
        },
        async (req) => {
          ensureCapability(
            req._problemCapability,
            ProblemCapability.CAP_CONTENT,
            s.httpErrors.forbidden()
          )
          const hash = (req.params as { hash: string }).hash
          const { modifiedCount } = await problems.updateOne(
            { _id: req._problemId, currentDataHash: { $ne: hash } },
            { $unset: { [`data.${hash}`]: 1 } }
          )
          if (!modifiedCount) {
            throw s.httpErrors.conflict()
          }
          return {}
        }
      )
    }) satisfies FastifyPluginAsyncTypebox,
    { prefix: '/data/:hash' }
  )

  s.patch(
    '/currentDataHash',
    {
      schema: {
        description: 'Update problem current data hash',
        body: Type.Object({
          hash: Type.String()
        }),
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req) => {
      ensureCapability(
        req._problemCapability,
        ProblemCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )
      const { hash } = req.body
      const { modifiedCount } = await problems.updateOne(
        { _id: req._problemId, [`data.${hash}`]: { $exists: true } },
        { $set: { currentDataHash: hash } }
      )
      if (!modifiedCount) {
        throw s.httpErrors.conflict()
      }
      return {}
    }
  )

  s.post(
    '/submit',
    {
      schema: {
        description: 'Submit a solution',
        body: Type.Object({
          hash: Type.String(),
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
      const oss = await loadOrgOssSettings(req._problem.orgId)
      if (!oss) return rep.preconditionFailed('OSS not configured')

      const { data, currentDataHash } = req._problem
      const currentData = data[currentDataHash]
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
        size: req.body.size,
        sha256: req.body.hash
      })
      return { solutionId: value._id, uploadUrl }
    }
  )
})
