import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { findPaginated, hasCapability } from '../../utils/index.js'
import { ISolution, ProblemCapability, SolutionState, solutions } from '../../db/index.js'
import { BSON } from 'mongodb'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { solutionDataKey, solutionDetailsKey } from '../../index.js'
import { kProblemContext } from './inject.js'

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
    const ctx = req.inject(kProblemContext)

    const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
    const admin = hasCapability(ctx._problemCapability, ProblemCapability.CAP_ADMIN)
    const { modifiedCount } = await solutions.updateOne(
      {
        _id: solutionId,
        contestId: { $exists: false },
        problemId: ctx._problemId,
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
    const ctx = req.inject(kProblemContext)

    const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
    const admin = hasCapability(ctx._problemCapability, ProblemCapability.CAP_ADMIN)
    if (!admin) return rep.forbidden()

    const { modifiedCount } = await solutions.updateOne(
      {
        _id: solutionId,
        contestId: { $exists: false },
        problemId: ctx._problemId,
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
      const ctx = req.inject(kProblemContext)
      const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
      const solution = await solutions.findOne(
        {
          _id: solutionId,
          contestId: { $exists: false },
          problemId: ctx._problemId
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
          }
        }
      )
      if (!solution) return rep.notFound()
      return solution
    }
  )

  s.register(getFileUrl, {
    prefix: '/details',
    resolve: async (type, query, req) => {
      const ctx = req.inject(kProblemContext)

      const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
      const solution = await solutions.findOne({
        _id: solutionId,
        contestId: { $exists: false },
        problemId: ctx._problemId
      })
      if (!solution) throw s.httpErrors.notFound()
      return [await loadOrgOssSettings(ctx._problem.orgId), solutionDetailsKey(solution._id)]
    },
    allowedTypes: ['download']
  })

  s.register(getFileUrl, {
    prefix: '/data',
    resolve: async (type, query, req) => {
      const ctx = req.inject(kProblemContext)

      const solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.badRequest())
      const solution = await solutions.findOne({
        _id: solutionId,
        contestId: { $exists: false },
        problemId: ctx._problemId
      })
      if (!solution) throw s.httpErrors.notFound()
      return [await loadOrgOssSettings(ctx._problem.orgId), solutionDataKey(solution._id)]
    },
    allowedTypes: ['download']
  })
})

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
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
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
      const ctx = req.inject(kProblemContext)

      const userId = req.query.userId ? new BSON.UUID(req.query.userId) : undefined
      // check auth
      const isAdmin = hasCapability(ctx._problemCapability, ProblemCapability.CAP_ADMIN)
      const isCurrentUser = userId !== undefined && userId.equals(req.user.userId)
      if (!isAdmin && !isCurrentUser) {
        return rep.forbidden()
      }
      return await findPaginated<ISolution>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        solutions as any,
        req.query.page,
        req.query.perPage,
        req.query.count,
        {
          problemId: ctx._problemId,
          contestId: { $exists: false },
          userId: req.query.userId ? new BSON.UUID(req.query.userId) : undefined
        },
        {
          projection: {
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
