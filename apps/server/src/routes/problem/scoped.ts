import { Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import { problemConfigSchema } from '@aoi/common'
import { IProblem, ProblemCapability, problems } from '../../db/problem.js'
import {
  defineRoutes,
  getUrl,
  getUrlSchema,
  loadCapability,
  loadMembership,
  loadUUID,
  paramSchemaMerger
} from '../common/index.js'
import { CAP_ALL, ensureCapability } from '../../utils/capability.js'
import { OrgCapability } from '../../db/org.js'
import { TypeUUID, TypeAccessLevel, StrictObject } from '../../utils/types.js'
import { getUploadUrl } from '../../oss/index.js'
import { SolutionState, solutions } from '../../db/solution.js'

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

  s.put(
    '/attachment/:key',
    {
      schema: {
        description: 'Update problem attachment',
        params: Type.Object({
          key: Type.String()
        }),
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

      await problems.updateOne(
        { _id: req._problemId },
        { $set: { [`attachments.${req.params.key}`]: req.body } }
      )
      return {}
    }
  )

  s.delete(
    '/attachment/:key',
    {
      schema: {
        description: 'Delete problem attachment',
        params: Type.Object({
          key: Type.String()
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

      await problems.updateOne(
        { _id: req._problemId },
        { $unset: { [`attachments.${req.params.key}`]: 1 } }
      )
      return {}
    }
  )

  s.get(
    '/attachment/:key/url',
    {
      schema: {
        description: 'Get problem attachment presigned url',
        params: Type.Object({
          key: Type.String()
        }),
        querystring: getUrlSchema,
        response: {
          200: Type.Object({
            url: Type.String()
          })
        }
      }
    },
    async (req) => {
      const attachment = req._problem.attachments[req.params.key]
      if (!attachment) {
        throw s.httpErrors.notFound()
      }
      const { type } = req.query
      // Allow download without attachment capability
      if (type !== 'download') {
        ensureCapability(
          req._problemCapability,
          ProblemCapability.CAP_CONTENT,
          s.httpErrors.forbidden()
        )
      }
      const key = `org/${req._orgId}/prob/${req._problemId}/attachments/${req.params.key}`
      const url = await getUrl(req.query, key, s.httpErrors.badRequest())

      return { url }
    }
  )

  s.post(
    '/data',
    {
      schema: {
        description: 'Create a new problem data version',
        body: Type.Object({
          hash: Type.String(),
          size: Type.Integer({ minimum: 0 }),
          config: problemConfigSchema,
          description: Type.String()
        }),
        response: {
          200: Type.Object({
            url: Type.String()
          })
        }
      }
    },
    async (req) => {
      ensureCapability(
        req._problemCapability,
        ProblemCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )
      const { hash, config, description } = req.body
      const { modifiedCount } = await problems.updateOne(
        { _id: req._problemId, [`data.${hash}`]: { $exists: false } },
        {
          $set: {
            [`data.${hash}`]: {
              createdAt: Date.now(),
              config,
              description
            }
          }
        }
      )
      if (!modifiedCount) {
        throw s.httpErrors.conflict()
      }
      const key = `org/${req._orgId}/prob/${req._problemId}/data/${hash}`
      const url = await getUploadUrl(key, { size: req.body.size, sha256: hash, expiresIn: 300 })
      return { url }
    }
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

  s.patch(
    '/data/:hash',
    {
      schema: {
        description: 'Update problem data version',
        params: Type.Object({
          hash: Type.String()
        }),
        body: Type.Object({
          config: Type.String(),
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
      const { hash } = req.params
      const { modifiedCount } = await problems.updateOne(
        { _id: req._problemId, [`data.${hash}`]: { $exists: true } },
        {
          $set: {
            [`data.${hash}.config`]: req.body.config,
            [`data.${hash}.description`]: req.body.description
          }
        }
      )
      if (!modifiedCount) {
        throw s.httpErrors.badRequest()
      }
      return {}
    }
  )

  s.delete(
    '/data/:hash',
    {
      schema: {
        description: 'Delete problem data version',
        params: Type.Object({
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
      const { hash } = req.params
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

  s.get(
    '/data/:hash/url',
    {
      schema: {
        description: 'Get problem data presigned url',
        params: Type.Object({
          hash: Type.String()
        }),
        querystring: getUrlSchema,
        response: {
          200: Type.Object({
            url: Type.String()
          })
        }
      }
    },
    async (req) => {
      const data = req._problem.data[req.params.hash]
      if (!data) {
        throw s.httpErrors.notFound()
      }
      const { type } = req.query
      // Only allow upload when creating version
      if (type === 'upload') {
        throw s.httpErrors.badRequest()
      }
      ensureCapability(
        req._problemCapability,
        ProblemCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )
      const key = `org/${req._orgId}/prob/${req._problemId}/data/${req.params.hash}`
      const url = await getUrl(req.query, key, s.httpErrors.badRequest())
      return { url }
    }
  )

  s.post(
    '/submit',
    {
      schema: {
        description: 'Submit a solution',
        body: Type.Object({
          hash: Type.String()
        }),
        response: {
          200: Type.Object({
            solutionId: TypeUUID()
          })
        }
      }
    },
    async (req) => {
      const { data, currentDataHash } = req._problem
      const currentData = data[currentDataHash]
      if (!currentData) throw s.httpErrors.badRequest()
      const { config } = currentData
      const { insertedId } = await solutions.insertOne({
        _id: new BSON.UUID(),
        problemId: req._problemId,
        userId: req.user.userId,
        labels: config.labels,
        problemDataHash: currentDataHash,
        state: SolutionState.CREATED,
        solutionDataHash: req.body.hash,
        score: 0,
        metrics: {},
        message: '',
        details: '',
        createdAt: Date.now()
      })
      return {
        solutionId: insertedId
      }
    }
  )
})
