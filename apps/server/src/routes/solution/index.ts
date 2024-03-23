import { Type } from '@sinclair/typebox'
import { defineRoutes, generateRangeQuery, loadUUID, swaggerTagMerger } from '../common/index.js'
import { solutionScopedRoute } from './scoped.js'
import { hasCapability, paginationSkip } from '../../utils/index.js'
import { ISolution, ORG_CAPS } from '../../db/index.js'
import { BSON } from 'mongodb'

export const solutionRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('solution'))

  s.get(
    '/',
    {
      schema: {
        description: 'Get s.db.solutions list',
        querystring: Type.Object({
          orgId: Type.UUID(),
          userId: Type.Optional(Type.UUID()),
          problemId: Type.Optional(Type.UUID()),
          contestId: Type.Optional(Type.UUID()),

          state: Type.Optional(Type.Integer({ minimum: 0, maximum: 4 })),
          status: Type.Optional(Type.String()),
          scoreL: Type.Optional(Type.Number()),
          scoreR: Type.Optional(Type.Number()),
          submittedAtL: Type.Optional(Type.Integer()),
          submittedAtR: Type.Optional(Type.Integer()),

          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30, 50, 100] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
              problemId: Type.UUID(),
              contestId: Type.Optional(Type.UUID()),
              userId: Type.UUID(),
              problemTitle: Type.String(),
              contestTitle: Type.Optional(Type.String()),
              state: Type.Integer(),
              score: Type.Number(),
              metrics: Type.Record(Type.String(), Type.Number()),
              status: Type.String(),
              message: Type.String(),
              submittedAt: Type.Optional(Type.Number())
            })
          )
        }
      }
    },
    async (req, rep) => {
      const userId = req.query.userId ? new BSON.UUID(req.query.userId) : undefined
      // check org auth, user should be in the org
      const orgId = loadUUID(req.query, 'orgId', s.httpErrors.badRequest())
      const membership = await s.db.orgMemberships.findOne({
        orgId: orgId,
        userId: req.user.userId
      })
      if (!membership) {
        return rep.forbidden()
      }
      // check auth, satisfy one of the following:
      // 1. admin of the org
      // 2. userId exists and userId is current user
      const isAdmin = hasCapability(membership.capability, ORG_CAPS.CAP_ADMIN)
      const isCurrentUser = userId !== undefined && userId.equals(req.user.userId)
      if (!isAdmin && !isCurrentUser) {
        return rep.forbidden()
      }
      const filter = {
        contestId: req.query.contestId ? new BSON.UUID(req.query.contestId) : undefined,
        problemId: req.query.problemId ? new BSON.UUID(req.query.problemId) : undefined,
        userId: req.query.userId ? new BSON.UUID(req.query.userId) : undefined,
        state: req.query.state,
        status: req.query.status,
        score: generateRangeQuery(req.query.scoreL, req.query.scoreR),
        submittedAt: generateRangeQuery(req.query.submittedAtL, req.query.submittedAtR)
      }
      const skip = paginationSkip(req.query.page, req.query.perPage)
      const total = req.query.count
        ? await s.db.solutions.countDocuments(filter, { ignoreUndefined: true })
        : undefined
      const items = (await s.db.solutions
        .aggregate(
          [
            { $match: filter },
            { $sort: { submittedAt: -1 } },
            { $skip: skip },
            { $limit: req.query.perPage },
            {
              $lookup: {
                from: 'problems',
                localField: 'problemId',
                foreignField: '_id',
                as: 'problem'
              }
            },
            { $unwind: '$problem' },
            {
              $lookup: {
                from: 'contests',
                localField: 'contestId',
                foreignField: '_id',
                as: 'contest'
              }
            },
            { $unwind: { path: '$contest', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                problemId: 1,
                contestId: 1,
                userId: 1,
                problemTitle: '$problem.title',
                contestTitle: '$contest.title',
                state: 1,
                score: 1,
                metrics: 1,
                status: 1,
                message: 1,
                submittedAt: 1
              }
            }
          ],
          { ignoreUndefined: true }
        )
        .toArray()) as Array<
        ISolution & {
          problemTitle: string
          contestTitle?: string
        }
      >
      return { items, total }
    }
  )

  s.register(solutionScopedRoute, { prefix: '/:solutionId' })
})
