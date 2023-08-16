import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../../common/index.js'
import { findPaginated, hasCapability } from '../../../utils/index.js'
import { ContestCapability, ISolution, solutions } from '../../../db/index.js'
import { BSON } from 'mongodb'
import { getFileUrl, loadOrgOssSettings } from '../../common/files.js'
import { solutionDataKey, solutionDetailsKey } from '../../../index.js'
import { FastifyRequest } from 'fastify'

function checkUser(
  req: FastifyRequest,
  userId: string | BSON.UUID | undefined,
  bypass: boolean | undefined,
  bypassCap: BSON.Long = ContestCapability.CAP_ADMIN
) {
  return (
    bypass ||
    hasCapability(req._contestCapability, bypassCap) ||
    req.user.userId.equals(userId ?? '')
  )
}

export const contestSolutionRoutes = defineRoutes(async (s) => {
  s.get(
    '/',
    {
      schema: {
        description: 'Get contest solutions',
        querystring: Type.Object({
          userId: Type.Optional(Type.String()),
          problemId: Type.Optional(Type.String()),
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(
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
    async (req, rep) => {
      const { solutionShowOther } = req._contestStage.settings
      if (!checkUser(req, req.query.userId, solutionShowOther)) {
        return rep.forbidden()
      }
      return await findPaginated<ISolution & { submittedAt: number }>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        solutions as any,
        req.query.page,
        req.query.perPage,
        req.query.count,
        {
          contestId: req._contest,
          problemId: req.query.problemId ? new BSON.UUID(req.query.problemId) : undefined,
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
            contestId: req._contestId
          })
          if (!solution) throw s.httpErrors.notFound()
          const { solutionShowOtherDetails } = req._contestStage.settings
          if (!checkUser(req, solution.userId, solutionShowOtherDetails)) {
            throw s.httpErrors.forbidden()
          }
          return [await loadOrgOssSettings(req._contest.orgId), solutionDataKey(solution._id)]
        },
        allowedTypes: ['download']
      })
      s.register(getFileUrl, {
        prefix: '/data',
        resolve: async (type, query, req) => {
          const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
          const solution = await solutions.findOne({
            _id: solutionId,
            contestId: req._contestId
          })
          if (!solution) throw s.httpErrors.notFound()
          const { solutionShowOtherData } = req._contestStage.settings
          if (!checkUser(req, solution.userId, solutionShowOtherData)) {
            throw s.httpErrors.forbidden()
          }
          return [await loadOrgOssSettings(req._contest.orgId), solutionDetailsKey(solution._id)]
        },
        allowedTypes: ['download']
      })
    }),
    { prefix: '/:solutionId' }
  )
})
