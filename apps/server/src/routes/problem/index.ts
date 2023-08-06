import { Type } from '@sinclair/typebox'
import { defineRoutes, loadMembership, loadUUID, swaggerTagMerger } from '../common/index.js'
import { problemScopedRoutes } from './scoped.js'
import { CAP_NONE, ensureCapability } from '../../utils/capability.js'
import { BSON } from 'mongodb'
import { OrgCapability } from '../../db/org.js'
import { problems } from '../../db/problem.js'
import { TypePaginationResult, findPaginated } from '../../utils/pagination.js'
import { StrictObject, TypeAccessLevel, TypeUUID } from '../../schemas/common.js'

export const problemRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('problem'))

  s.register(problemScopedRoutes, { prefix: '/:problemId' })

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new problem',
        body: StrictObject({
          orgId: Type.String(),
          slug: Type.String(),
          title: Type.String(),
          accessLevel: TypeAccessLevel()
        }),
        response: {
          200: Type.Object({
            problemId: TypeUUID()
          })
        }
      }
    },
    async (req) => {
      const orgId = loadUUID(req.body, 'orgId', s.httpErrors.badRequest())
      const membership = await loadMembership(req.user.userId, orgId)
      ensureCapability(
        membership?.capability ?? CAP_NONE,
        OrgCapability.CAP_PROBLEM,
        s.httpErrors.forbidden()
      )
      const { insertedId } = await problems.insertOne({
        _id: new BSON.UUID(),
        orgId,
        slug: req.body.slug,
        title: req.body.title,
        description: '',
        tags: [],
        attachments: {},
        data: {},
        currentDataHash: '',
        associations: [],
        accessLevel: req.body.accessLevel,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
      return {
        problemId: insertedId
      }
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'List problems',
        querystring: Type.Object({
          orgId: Type.String(),
          page: Type.Integer({ minimum: 0, default: 0 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: TypePaginationResult(
            Type.Object({
              //
            })
          )
        }
      }
    },
    async (req) => {
      const orgId = loadUUID(req.query, 'orgId', s.httpErrors.badRequest())
      // TODO: Access Control
      const { page, perPage, count } = req.query
      const result = await findPaginated(problems, page, perPage, count, { orgId })
      return result
    }
  )
})
