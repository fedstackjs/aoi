import { Filter, UUID } from 'mongodb'

import { IInstance, InstanceState, ORG_CAPS } from '../../db/index.js'
import { T } from '../../schemas/index.js'
import { hasCapability, paginationSkip } from '../../utils/index.js'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'

import { instanceScopedRoute } from './scoped.js'

export const instanceRoutes = defineRoutes(async (s) => {
  const { orgMemberships, instances } = s.db

  s.addHook('onRoute', swaggerTagMerger('instance'))

  s.get(
    '/',
    {
      schema: {
        description: 'Get instance list',
        querystring: T.Object({
          orgId: T.UUID(),
          userId: T.Optional(T.UUID()),
          problemId: T.Optional(T.UUID()),
          contestId: T.Optional(T.UUID()),
          state: T.Optional(T.IntegerEnum(InstanceState)),
          page: T.Integer({ minimum: 1, default: 1 }),
          perPage: T.Integer({ enum: [15, 30, 50, 100] }),
          count: T.Boolean({ default: false })
        }),
        response: {
          200: T.PaginationResult(
            T.Object({
              _id: T.UUID(),
              userId: T.UUID(),
              problemId: T.UUID(),
              contestId: T.Optional(T.UUID()),
              problemTitle: T.String(),
              contestTitle: T.Optional(T.String()),
              slotNo: T.Integer(),
              state: T.Integer(),
              taskState: T.Optional(T.Integer()),
              message: T.String(),
              createdAt: T.Integer(),
              activatedAt: T.Optional(T.Integer()),
              destroyedAt: T.Optional(T.Integer())
            })
          )
        }
      }
    },
    async (req, rep) => {
      const userId = req.query.userId ? new UUID(req.query.userId) : undefined
      const orgId = loadUUID(req.query, 'orgId', s.httpErrors.badRequest())
      const membership = await orgMemberships.findOne({
        orgId: orgId,
        userId: req.user.userId
      })
      const isAdmin = membership && hasCapability(membership.capability, ORG_CAPS.CAP_ADMIN)
      const isCurrentUser = userId !== undefined && userId.equals(req.user.userId)
      if (!isAdmin && !isCurrentUser) {
        return rep.forbidden()
      }
      const filter = {
        contestId: req.query.contestId
          ? UUID.isValid(req.query.contestId)
            ? new UUID(req.query.contestId)
            : { $exists: false }
          : undefined,
        problemId: req.query.problemId ? new UUID(req.query.problemId) : undefined,
        userId,
        state: req.query.state
      } satisfies Filter<IInstance>
      const skip = paginationSkip(req.query.page, req.query.perPage)
      const total = req.query.count
        ? await instances.countDocuments(filter, { ignoreUndefined: true })
        : undefined
      const items = (await instances
        .aggregate(
          [
            { $match: filter },
            { $sort: { createdAt: -1 } },
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
              $addFields: {
                problemTitle: '$problem.title',
                contestTitle: '$contest.title'
              }
            }
          ],
          { ignoreUndefined: true }
        )
        .toArray()) as Array<
        IInstance & {
          problemTitle: string
          contestTitle?: string
        }
      >
      return { items, total }
    }
  )

  s.register(instanceScopedRoute, { prefix: '/:instanceId' })
})
