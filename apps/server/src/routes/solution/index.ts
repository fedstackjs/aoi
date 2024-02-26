import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'
import { solutionScopedRoute } from './scoped.js'
import { findPaginated, hasCapability } from '../../utils/index.js'
import { ISolution, ORG_CAPS, problems, solutions } from '../../db/index.js'
import { BSON } from 'mongodb'
import { orgMemberships } from '../../db/index.js'

export const solutionRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('solution'))

  s.get(
    '/',
    {
      schema: {
        description: 'Get solutions list',
        querystring: Type.Object({
          orgId: Type.UUID(),
          userId: Type.Optional(Type.UUID()),
          problemId: Type.Optional(Type.UUID()),
          contestId: Type.Optional(Type.UUID()),
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30] }),
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
      const problemId = req.query.problemId ? new BSON.UUID(req.query.problemId) : undefined
      const contestId = req.query.contestId ? new BSON.UUID(req.query.contestId) : undefined
      const userId = req.query.userId ? new BSON.UUID(req.query.userId) : undefined
      // check org auth, user should be in the org
      const orgId = loadUUID(req.query, 'orgId', s.httpErrors.badRequest())
      const membership = await orgMemberships.findOne({
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
      const result = await findPaginated<ISolution>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        solutions as any,
        req.query.page,
        req.query.perPage,
        req.query.count,
        {
          problemId: problemId,
          contestId: contestId,
          userId: userId
        },
        {
          projection: {
            problemId: 1,
            contestId: 1,
            userId: 1,
            state: 1,
            score: 1,
            metrics: 1,
            status: 1,
            message: 1,
            submittedAt: 1
          },
          sort: {
            submittedAt: -1
          },
          ignoreUndefined: true
        }
      )
      // add problem title into return result
      const problemIds = result.items.map((s) => s.problemId)
      const problemMap = new Map<string, string>()
      const problemDocs = await problems.find({ _id: { $in: problemIds } }).toArray()
      problemDocs.forEach((p) => problemMap.set(p._id.toString(), p.title))
      return {
        items: result.items.map((s) => {
          return {
            ...s,
            problemTitle: problemMap.get(s.problemId.toString()) as string
          }
        }),
        total: result.total
      }
    }
  )

  s.register(solutionScopedRoute, { prefix: '/:solutionId' })
})
