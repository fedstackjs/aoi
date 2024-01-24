import { Type } from '@sinclair/typebox'
import {
  defineRoutes,
  generateRangeQuery,
  loadUUID,
  paramSchemaMerger
} from '../../common/index.js'
import { findPaginated, hasCapability } from '../../../utils/index.js'
import { ContestCapability, ISolution, SolutionState, solutions } from '../../../db/index.js'
import { BSON } from 'mongodb'
import { getFileUrl, loadOrgOssSettings } from '../../common/files.js'
import { solutionDataKey, solutionDetailsKey } from '../../../index.js'
import { FastifyRequest } from 'fastify'
import { kContestContext } from '../inject.js'

function checkUser(
  req: FastifyRequest,
  userId: string | BSON.UUID | undefined,
  bypass: boolean | undefined,
  bypassCap: BSON.Long = ContestCapability.CAP_ADMIN
) {
  const ctx = req.inject(kContestContext)
  return (
    bypass ||
    hasCapability(ctx._contestCapability, bypassCap) ||
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
    const ctx = req.inject(kContestContext)

    const { solutionAllowSubmit } = ctx._contestStage.settings
    if (
      !solutionAllowSubmit &&
      !hasCapability(ctx._contestCapability, ContestCapability.CAP_ADMIN)
    ) {
      return rep.forbidden()
    }

    const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
    const admin = hasCapability(ctx._contestCapability, ContestCapability.CAP_ADMIN)
    const { modifiedCount } = await solutions.updateOne(
      {
        _id: solutionId,
        contestId: ctx._contestId,
        userId: admin ? undefined : req.user.userId,
        state: admin ? undefined : SolutionState.CREATED
      },
      [
        {
          $set: {
            state: SolutionState.PENDING,
            submittedAt: { $convert: { input: '$$NOW', to: 'double' } },
            score: 0,
            status: '',
            metrics: {},
            message: ''
          }
        },
        { $unset: ['taskId', 'runnerId'] }
      ],
      { ignoreUndefined: true }
    )
    if (modifiedCount === 0) return rep.notFound()
    return {}
  })

  s.post('/rejudge', {}, async (req, rep) => {
    const ctx = req.inject(kContestContext)

    const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
    const admin = hasCapability(ctx._contestCapability, ContestCapability.CAP_ADMIN)
    if (!admin) return rep.forbidden()

    const { modifiedCount } = await solutions.updateOne(
      {
        _id: solutionId,
        contestId: ctx._contestId,
        state: { $ne: SolutionState.CREATED }
      },
      [
        {
          $set: {
            state: SolutionState.PENDING,
            score: 0,
            status: '',
            metrics: {},
            message: ''
          }
        },
        { $unset: ['taskId', 'runnerId'] }
      ],
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
            label: Type.String(),
            problemId: Type.UUID(),
            userId: Type.UUID(),
            problemDataHash: Type.String(),
            state: Type.Integer(),
            score: Type.Number(),
            metrics: Type.Record(Type.String(), Type.Number()),
            status: Type.String(),
            message: Type.String(),
            createdAt: Type.Number(),
            submittedAt: Type.Optional(Type.Number()),
            completedAt: Type.Optional(Type.Number())
          })
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)

      const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
      const { solutionShowOther } = ctx._contestStage.settings
      const admin = hasCapability(ctx._contestCapability, ContestCapability.CAP_ADMIN)
      const solution = await solutions.findOne(
        {
          _id: solutionId,
          contestId: ctx._contestId,
          userId: admin || solutionShowOther ? undefined : req.user.userId
        },
        {
          projection: {
            label: 1,
            problemId: 1,
            userId: 1,
            problemDataHash: 1,
            state: 1,
            score: 1,
            metrics: 1,
            status: 1,
            message: 1,
            createdAt: 1,
            submittedAt: 1,
            completedAt: 1
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
      const ctx = req.inject(kContestContext)

      const { solutionShowOtherDetails, solutionShowDetails } = ctx._contestStage.settings
      if (
        !solutionShowDetails &&
        !hasCapability(ctx._contestCapability, ContestCapability.CAP_ADMIN)
      ) {
        throw s.httpErrors.forbidden()
      }

      const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
      const solution = await solutions.findOne({
        _id: solutionId,
        contestId: ctx._contestId
      })
      if (!solution) throw s.httpErrors.notFound()
      if (!checkUser(req, solution.userId, solutionShowOtherDetails)) {
        throw s.httpErrors.forbidden()
      }
      return [await loadOrgOssSettings(ctx._contest.orgId), solutionDetailsKey(solution._id)]
    },
    allowedTypes: ['download']
  })

  s.register(getFileUrl, {
    prefix: '/data',
    resolve: async (type, query, req) => {
      const ctx = req.inject(kContestContext)

      const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
      const solution = await solutions.findOne({
        _id: solutionId,
        contestId: ctx._contestId
      })
      if (!solution) throw s.httpErrors.notFound()
      const { solutionShowOtherData } = ctx._contestStage.settings
      if (!checkUser(req, solution.userId, solutionShowOtherData)) {
        throw s.httpErrors.forbidden()
      }
      return [await loadOrgOssSettings(ctx._contest.orgId), solutionDataKey(solution._id)]
    },
    allowedTypes: ['download']
  })
})

export const contestSolutionRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kContestContext)

    const { solutionEnabled } = ctx._contestStage.settings
    if (!solutionEnabled && !hasCapability(ctx._contestCapability, ContestCapability.CAP_ADMIN)) {
      return rep.forbidden()
    }
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get contest solutions',
        querystring: Type.Object({
          userId: Type.Optional(Type.String()),
          problemId: Type.Optional(Type.String()),
          state: Type.Optional(Type.Integer({ minimum: 0, maximum: 4 })),
          status: Type.Optional(Type.String()),
          scoreL: Type.Optional(Type.Number()),
          scoreR: Type.Optional(Type.Number()),
          submittedAtL: Type.Optional(Type.Integer()),
          submittedAtR: Type.Optional(Type.Integer()),
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
              problemId: Type.UUID(),
              userId: Type.UUID(),
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
      const ctx = req.inject(kContestContext)

      const { solutionShowOther } = ctx._contestStage.settings
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
          contestId: ctx._contest._id,
          problemId: req.query.problemId ? new BSON.UUID(req.query.problemId) : undefined,
          userId: req.query.userId ? new BSON.UUID(req.query.userId) : undefined,
          state: req.query.state,
          status: req.query.status,
          score: generateRangeQuery(req.query.scoreL, req.query.scoreR),
          submittedAt: generateRangeQuery(req.query.submittedAtL, req.query.submittedAtR)
        },
        {
          projection: {
            problemId: 1,
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
    }
  )

  s.register(solutionScopedRoutes, { prefix: '/:solutionId' })
})
