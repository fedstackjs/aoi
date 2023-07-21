import { TSchema, Type } from '@sinclair/typebox'
import { IOrgMembership, OrgCapability } from '../../db/org.js'
import { IProblem, ProblemAccessLevel, ProblemCapability, problems } from '../../db/problem.js'
import { computeCapability, ensureCapability, hasCapability } from '../../utils/capability.js'
import {
  defineRoutes,
  getUrl,
  getUrlSchema,
  paginationSchema,
  paginationToOptions
} from '../common/index.js'
import { StrictObject, TypeUUID } from '../../utils/types.js'
import { BSON } from 'mongodb'
import { getUploadUrl } from '../../oss/index.js'

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

function defaultCapability(level: ProblemAccessLevel, membership: IOrgMembership | null) {
  if (level === ProblemAccessLevel.PUBLIC) {
    return ProblemCapability.CAP_ACCESS
  }
  if (level === ProblemAccessLevel.RESTRICED) {
    if (!membership) return BSON.Long.ZERO
    return ProblemCapability.CAP_ACCESS
  }
  return BSON.Long.ZERO
}

const problemScopedRoutes = defineRoutes(async (s) => {
  s.decorateRequest('problemId', null)
  s.decorateRequest('problemCapability', null)
  s.decorateRequest('problem', null)

  s.addHook('onRoute', (route) => {
    const oldParams = route.schema?.params
    if (oldParams) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      route.schema!.params = Type.Intersect([oldParams as TSchema, problemIdSchema])
    } else {
      ;(route.schema ??= {}).params = problemIdSchema
    }
  })

  s.addHook('onRequest', async (req, rep) => {
    const { problemId } = req.params as Record<string, string>
    if (!BSON.UUID.isValid(problemId)) {
      return rep.send(rep.notFound())
    }
    const _problemId = new BSON.UUID(problemId)
    // TODO: optimize this query with projection
    const problem = await problems.findOne({ _id: _problemId, orgId: req._orgId })
    if (!problem) {
      return rep.send(rep.notFound())
    }
    const capability = computeCapability(
      problem,
      req._orgMembership,
      defaultCapability(problem.accessLevel, req._orgMembership)
    )
    if (!hasCapability(capability, ProblemCapability.CAP_ACCESS)) {
      return rep.send(rep.forbidden())
    }
    req._problemId = _problemId
    req._problem = problem
    req._problemCapability = capability
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get problem details',
        response: {
          200: Type.Object({
            _id: TypeUUID(),
            accessLevel: Type.Integer({ enum: Object.values(ProblemAccessLevel) }),
            slug: Type.String(),
            title: Type.String(),
            description: Type.String(),
            tags: Type.Array(Type.String()),
            attachments: Type.Record(
              Type.String(),
              Type.Object({
                name: Type.String(),
                description: Type.String()
              })
            ),
            config: Type.String()
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
          config: Type.String(),
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
        description: 'Delete problem data version',
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
})

function getAccessLevel(membership: IOrgMembership | null) {
  if (!membership) {
    return ProblemAccessLevel.PUBLIC
  }
  if (hasCapability(membership.capability, OrgCapability.CAP_PROBLEM)) {
    return ProblemAccessLevel.PRIVATE
  }
  return ProblemAccessLevel.RESTRICED
}

const problemListSchema = Type.Array(
  Type.Object({
    _id: TypeUUID(),
    accessLevel: Type.Integer({ enum: Object.values(ProblemAccessLevel) }),
    slug: Type.String(),
    title: Type.String(),
    tags: Type.Array(Type.String())
  })
)

export const orgProblemRoutes = defineRoutes(async (s) => {
  s.register(problemScopedRoutes, { prefix: '/:problemId' })

  s.get(
    '/count',
    {
      schema: {
        description: 'Count all problems in the organization',
        response: {
          200: Type.Integer({ minimum: 0 })
        }
      }
    },
    async (req) => {
      const accessLevel = getAccessLevel(req._orgMembership)
      const problemCount = await problems.countDocuments({
        accessLevel: { $lte: accessLevel },
        orgId: req._orgId
      })
      return problemCount
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'List all problems in the organization',
        querystring: paginationSchema,
        response: {
          200: problemListSchema
        }
      }
    },
    async (req) => {
      const accessLevel = getAccessLevel(req._orgMembership)
      const problemList = await problems
        .find(
          {
            accessLevel: { $lte: accessLevel },
            orgId: req._orgId
          },
          {
            ...paginationToOptions(req.query),
            projection: {
              accessLevel: 1,
              slug: 1,
              title: 1,
              tags: 1
            }
          }
        )
        .toArray()
      return problemList
    }
  )

  s.get(
    '/me',
    {
      schema: {
        description: 'List assigned problems in the organization',
        response: {
          200: problemListSchema
        }
      }
    },
    async (req) => {
      const groups = req._orgMembership?.groups.map((g) => g.groupId) ?? []
      const problemList = await problems
        .find(
          {
            $or: [{ 'associations.principalId': { $in: groups } }, { ownerId: req.user.userId }],
            orgId: req._orgId
          },
          {
            projection: {
              accessLevel: 1,
              slug: 1,
              title: 1,
              tags: 1
            }
          }
        )
        .toArray()
      return problemList
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new problem',
        body: Type.Object({
          accessLevel: Type.Integer({ enum: Object.values(ProblemAccessLevel) }),
          slug: Type.String(),
          title: Type.String()
        }),
        response: {
          200: Type.Object({
            problemId: TypeUUID()
          })
        }
      }
    },
    async (req) => {
      if (getAccessLevel(req._orgMembership) !== ProblemAccessLevel.PRIVATE) {
        throw s.httpErrors.forbidden()
      }
      const { insertedId } = await problems.insertOne({
        _id: new BSON.UUID(),
        orgId: req._orgId,
        accessLevel: req.body.accessLevel,
        slug: req.body.slug,
        title: req.body.title,
        description: '',
        tags: [],
        attachments: {},
        data: {},
        currentDataHash: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ownerId: req.user.userId,
        associations: []
      })
      return { problemId: insertedId }
    }
  )
})
