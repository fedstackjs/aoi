import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { TypePaginationResult, findPaginated } from '../../utils/index.js'
import { ISolution, solutions } from '../../db/index.js'
import { BSON } from 'mongodb'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { solutionDataKey, solutionDetailsKey } from '../../index.js'

export const problemSolutionRoutes = defineRoutes(async (s) => {
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
              _id: Type.UUID(),
              state: Type.Integer(),
              score: Type.Number(),
              metrics: Type.Record(Type.String(), Type.Number()),
              status: Type.String(),
              message: Type.String(),
              submittedAt: Type.Number()
            })
          )
        }
      }
    },
    async (req) => {
      return await findPaginated<ISolution & { submittedAt: number }>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        solutions as any,
        req.query.page,
        req.query.perPage,
        req.query.count,
        {
          problemId: req._problemId,
          contestId: { $exists: false },
          userId: req.query.userId ? new BSON.UUID(req.query.userId) : undefined,
          state: { $ne: 0 }
        },
        {
          projection: {
            state: 1,
            score: 1,
            metrics: 1,
            status: 1,
            submittedAt: 1
          },
          ignoreUndefined: true
        }
      )
    }
  )

  s.register(
    defineRoutes(async (s) => {
      s.addHook(
        'onRoute',
        paramSchemaMerger(
          Type.Object({
            solutionId: Type.String()
          })
        )
      )
      s.register(getFileUrl, {
        prefix: '/details',
        resolve: async (type, query, req) => {
          const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
          const solution = await solutions.findOne({
            _id: solutionId,
            contestId: { $exists: false },
            problemId: req._problemId
          })
          if (!solution) throw s.httpErrors.notFound()
          return [await loadOrgOssSettings(req._problem.orgId), solutionDataKey(solution._id)]
        },
        allowedTypes: ['download']
      })
      s.register(getFileUrl, {
        prefix: '/data',
        resolve: async (type, query, req) => {
          const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
          const solution = await solutions.findOne({
            _id: solutionId,
            contestId: { $exists: false },
            problemId: req._problemId
          })
          if (!solution) throw s.httpErrors.notFound()
          return [await loadOrgOssSettings(req._problem.orgId), solutionDetailsKey(solution._id)]
        },
        allowedTypes: ['download']
      })
    }),
    { prefix: '/:solutionId' }
  )
})
