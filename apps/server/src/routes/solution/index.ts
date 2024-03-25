import { BSON } from 'mongodb'

import { ISolution, ORG_CAPS } from '../../db/index.js'
import { T } from '../../schemas/index.js'
import { hasCapability, paginationSkip } from '../../utils/index.js'
import { defineRoutes, generateRangeQuery, loadUUID, swaggerTagMerger } from '../common/index.js'

import { solutionScopedRoute } from './scoped.js'

export const solutionRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('solution'))

  s.get(
    '/',
    {
      schema: {
        description: 'Get s.db.solutions list',
        querystring: T.Object({
          orgId: T.UUID(),
          userId: T.Optional(T.UUID()),
          problemId: T.Optional(T.UUID()),
          contestId: T.Optional(T.UUID()),

          state: T.Optional(T.Integer({ minimum: 0, maximum: 4 })),
          status: T.Optional(T.String()),
          scoreL: T.Optional(T.Number()),
          scoreR: T.Optional(T.Number()),
          submittedAtL: T.Optional(T.Integer()),
          submittedAtR: T.Optional(T.Integer()),

          page: T.Integer({ minimum: 1, default: 1 }),
          perPage: T.Integer({ enum: [15, 30, 50, 100] }),
          count: T.Boolean({ default: false })
        }),
        response: {
          200: T.PaginationResult(
            T.Object({
              _id: T.UUID(),
              problemId: T.UUID(),
              contestId: T.Optional(T.UUID()),
              userId: T.UUID(),
              problemTitle: T.String(),
              contestTitle: T.Optional(T.String()),
              state: T.Integer(),
              score: T.Number(),
              metrics: T.Record(T.String(), T.Number()),
              status: T.String(),
              message: T.String(),
              submittedAt: T.Optional(T.Number())
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
