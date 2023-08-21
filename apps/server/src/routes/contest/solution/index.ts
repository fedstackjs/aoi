import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../../common/index.js'
import { findPaginated, hasCapability } from '../../../utils/index.js'
import { ContestCapability, ISolution, SolutionState, solutions } from '../../../db/index.js'
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

const solutionScopedRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        solutionId: Type.String()
      })
    )
  )

  s.post('/submit', {}, async (req, rep) => {
    const { solutionAllowSubmit } = req._contestStage.settings
    if (!solutionAllowSubmit) return rep.forbidden()

    const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
    const admin = hasCapability(req._contestCapability, ContestCapability.CAP_ADMIN)
    const { modifiedCount } = await solutions.updateOne(
      {
        _id: solutionId,
        contestId: req._contestId,
        userId: admin ? undefined : req.user.userId,
        state: admin ? undefined : SolutionState.CREATED
      },
      { $set: { state: SolutionState.PENDING } },
      { ignoreUndefined: true }
    )
    if (modifiedCount === 0) return rep.notFound()
    return {}
  })

  s.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Object({
            _id: Type.UUID(),
            state: Type.Integer(),
            score: Type.Number(),
            metrics: Type.Record(Type.String(), Type.Number()),
            status: Type.String(),
            message: Type.String(),
            submittedAt: Type.Optional(Type.Number())
          })
        }
      }
    },
    async (req, rep) => {
      const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
      const { solutionShowOther } = req._contestStage.settings
      const admin = hasCapability(req._contestCapability, ContestCapability.CAP_ADMIN)
      const solution = await solutions.findOne(
        {
          _id: solutionId,
          contestId: req._contestId,
          userId: admin || solutionShowOther ? undefined : req.user.userId
        },
        {
          projection: {
            state: 1,
            score: 1,
            metrics: 1,
            status: 1,
            message: 1,
            submittedAt: 1
          },
          ignoreUndefined: true
        }
      )
      if (!solution) return rep.notFound()
      return solution
    }
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
      return [await loadOrgOssSettings(req._contest.orgId), solutionDetailsKey(solution._id)]
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
      return [await loadOrgOssSettings(req._contest.orgId), solutionDataKey(solution._id)]
    },
    allowedTypes: ['download']
  })
})

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
              submittedAt: Type.Optional(Type.Number())
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
          contestId: req._contest._id,
          problemId: req.query.problemId ? new BSON.UUID(req.query.problemId) : undefined,
          userId: req.query.userId ? new BSON.UUID(req.query.userId) : undefined
        },
        {
          projection: {
            state: 1,
            score: 1,
            metrics: 1,
            status: 1,
            message: 1,
            submittedAt: 1
          },
          ignoreUndefined: true
        }
      )
    }
  )

  s.register(solutionScopedRoutes, { prefix: '/:solutionId' })
})
