import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../common/index.js'
import { SUserProfile, TypeUUID } from '../../schemas/index.js'
import { TypePaginationResult, paginationSkip } from '../../utils/index.js'
import { solutions } from '../../db/index.js'
import { BSON, Document } from 'mongodb'

export const solutionRoutes = defineRoutes(async (s) => {
  s.get(
    '/',
    {
      schema: {
        description: 'Get problem solutions',
        querystring: Type.Object({
          userId: Type.Optional(Type.String()),
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: TypePaginationResult(
            Type.Object({
              _id: TypeUUID(),
              user: Type.Object({
                _id: TypeUUID(),
                profile: SUserProfile
              }),
              state: Type.Integer(),
              score: Type.Number(),
              metrics: Type.Record(Type.String(), Type.Number()),
              status: Type.String(),
              submittedAt: Type.Number()
            })
          )
        }
      }
    },
    async (req) => {
      const $match: Document = {
        problemId: req._problemId,
        contestId: { $exists: false },
        state: { $ne: 0 }
      }
      if (req.query.userId) {
        $match.userId = new BSON.UUID(req.query.userId)
      }

      let count = 0
      if (req.query.count) {
        count = await solutions.countDocuments($match)
      }
      const skip = paginationSkip(req.query.page, req.query.perPage)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any[] = await solutions
        .aggregate([
          { $match },
          { $skip: skip },
          { $limit: req.query.perPage },
          {
            $project: {
              _id: 1,
              userId: 1,
              state: 1,
              score: 1,
              metrics: 1,
              status: 1,
              submittedAt: 1
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              user: {
                _id: 1,
                profile: 1
              },
              state: 1,
              score: 1,
              metrics: 1,
              status: 1,
              submittedAt: 1
            }
          }
        ])
        .toArray()
      return {
        total: count,
        items: result
      }
    }
  )

  // TODO: Get solution details
})
