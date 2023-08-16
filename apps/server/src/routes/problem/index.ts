import { Type } from '@sinclair/typebox'
import { defineRoutes, loadMembership, loadUUID, swaggerTagMerger } from '../common/index.js'
import { problemScopedRoutes } from './scoped.js'
import { CAP_NONE, ensureCapability, hasCapability } from '../../utils/capability.js'
import { BSON } from 'mongodb'
import { OrgCapability, problems } from '../../db/index.js'
import { paginationSkip } from '../../utils/pagination.js'
import { AccessLevel } from '../../schemas/index.js'

export const problemRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('problem'))

  s.register(problemScopedRoutes, { prefix: '/:problemId' })

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new problem',
        body: Type.Object({
          orgId: Type.String(),
          slug: Type.String(),
          title: Type.String(),
          accessLevel: Type.AccessLevel()
        }),
        response: {
          200: Type.Object({
            problemId: Type.UUID()
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
        attachments: [],
        data: [],
        currentDataHash: '',
        settings: { allowPublicSubmit: false },
        associations: [],
        accessLevel: req.body.accessLevel,
        createdAt: Date.now()
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
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
              orgId: Type.UUID(),
              slug: Type.String(),
              title: Type.String(),
              tags: Type.Array(Type.String()),
              accessLevel: Type.AccessLevel(),
              createdAt: Type.Integer(),
              status: Type.Optional(
                Type.Object({
                  solutionCount: Type.Integer(),
                  lastSolutionId: Type.UUID(),
                  lastSolutionScore: Type.Number(),
                  lastSolutionStatus: Type.String()
                })
              )
            })
          )
        }
      }
    },
    async (req) => {
      const orgId = loadUUID(req.query, 'orgId', s.httpErrors.badRequest())
      const membership = await loadMembership(req.user.userId, orgId)
      const basicAccessLevel = membership
        ? hasCapability(membership.capability, OrgCapability.CAP_PROBLEM)
          ? AccessLevel.PRIVATE
          : AccessLevel.RESTRICED
        : AccessLevel.PUBLIC
      const principalIds = [req.user.userId, ...(membership?.groups ?? [])]
      const { page, perPage, count } = req.query
      const filter = {
        orgId,
        $or: [
          { accessLevel: { $lte: basicAccessLevel } },
          { 'associations.principalId': { $in: principalIds } }
        ]
      }
      let total = 0
      if (count) {
        total = await problems.countDocuments(filter)
      }
      const skip = paginationSkip(page, perPage)
      const items = await problems
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .aggregate<any>([
          { $match: filter },
          { $skip: skip },
          { $limit: perPage },
          {
            $lookup: {
              from: 'problemStatuses',
              let: { problemId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$problemId', '$$problemId'] },
                        { $eq: ['$userId', req.user.userId] }
                      ]
                    }
                  }
                }
              ],
              as: 'status'
            }
          },
          { $unwind: { path: '$status', preserveNullAndEmptyArrays: true } }
        ])
        .toArray()
      return { total, items }
    }
  )
})
