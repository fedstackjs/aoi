import { Type } from '@sinclair/typebox'
import {
  ContestCapability,
  ContestRanklistState,
  SolutionState,
  contests,
  solutions
} from '../../index.js'
import { ensureCapability } from '../../utils/index.js'
import { manageACL, manageAccessLevel } from '../common/access.js'
import { defineRoutes } from '../common/index.js'
import { SContestStage } from '../../schemas/contest.js'
import { kContestContext } from './inject.js'

export const contestAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    ensureCapability(
      req.inject(kContestContext)._contestCapability,
      ContestCapability.CAP_ADMIN,
      s.httpErrors.forbidden()
    )
  })

  s.register(manageACL, {
    collection: contests,
    resolve: async (req) => req.inject(kContestContext)._contestId,
    defaultCapability: ContestCapability.CAP_ACCESS,
    prefix: '/access'
  })
  s.register(manageAccessLevel, {
    collection: contests,
    resolve: async (req) => req.inject(kContestContext)._contestId,
    prefix: '/accessLevel'
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete contest'
      }
    },
    async (req) => {
      // TODO: handle dependencies
      await contests.deleteOne({ _id: req.inject(kContestContext)._contestId })
      return {}
    }
  )

  s.post(
    '/submit-all',
    {
      schema: {
        description: 'Submit all solutions',
        response: {
          200: Type.Object({
            modifiedCount: Type.Number()
          })
        }
      }
    },
    async (req) => {
      const { modifiedCount } = await solutions.updateOne(
        {
          contestId: req.inject(kContestContext)._contestId,
          state: SolutionState.CREATED
        },
        {
          $set: {
            state: SolutionState.PENDING,
            submittedAt: req._now,
            score: 0,
            status: '',
            metrics: {},
            message: ''
          }
        },
        { ignoreUndefined: true }
      )
      return { modifiedCount }
    }
  )

  s.get(
    '/ranklist-info',
    {
      schema: {
        response: {
          200: Type.Object({
            ranklistState: Type.Integer(),
            ranklistUpdatedAt: Type.Integer(),
            ranklistRunnerId: Type.Optional(Type.UUID())
          })
        }
      }
    },
    async (req) => {
      const { _contest } = req.inject(kContestContext)
      const { ranklistState, ranklistUpdatedAt, ranklistRunnerId } = _contest
      return {
        ranklistState,
        ranklistUpdatedAt,
        ranklistRunnerId
      }
    }
  )

  s.post('/update-ranklists', async (req) => {
    await contests.updateOne(
      {
        _id: req.inject(kContestContext)._contestId,
        ranklists: { $exists: true, $ne: [] }
      },
      {
        $set: {
          ranklistUpdatedAt: req._now,
          ranklistState: ContestRanklistState.INVALID
        }
      }
    )
    return 0
  })

  s.get(
    '/stages',
    {
      schema: {
        description: 'Update contest stages',
        response: { 200: Type.Array(SContestStage) }
      }
    },
    async (req) => {
      return req.inject(kContestContext)._contest.stages
    }
  )

  s.patch(
    '/stages',
    {
      schema: {
        description: 'Update contest stages',
        body: Type.Array(SContestStage)
      }
    },
    async (req, rep) => {
      const stages = req.body
      if (stages.length < 3) return rep.badRequest('At least 3 stages are required')
      if (stages[0].start !== 0) return rep.badRequest('First stage must start at 0')
      if (stages.some((stage, i) => i && stages[i - 1].start >= stage.start))
        return rep.badRequest('Stages must be in ascending order')
      const start = stages[1].start
      const end = stages[stages.length - 1].start

      await contests.updateOne(
        { _id: req.inject(kContestContext)._contestId },
        { $set: { stages, start, end } }
      )
      return {}
    }
  )
})
