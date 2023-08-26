import { Type } from '@sinclair/typebox'
import { ContestCapability, SolutionState, contests, solutions } from '../../index.js'
import { ensureCapability } from '../../utils/index.js'
import { manageACL, manageAccessLevel } from '../common/access.js'
import { defineRoutes } from '../common/index.js'
import { SContestStage } from '../../schemas/contest.js'

export const contestAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    ensureCapability(req._contestCapability, ContestCapability.CAP_ADMIN, s.httpErrors.forbidden())
  })

  s.register(manageACL, {
    collection: contests,
    resolve: async (req) => req._contestId,
    defaultCapability: ContestCapability.CAP_ACCESS,
    prefix: '/access'
  })
  s.register(manageAccessLevel, {
    collection: contests,
    resolve: async (req) => req._contestId,
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
      await contests.deleteOne({ _id: req._contestId })
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
          contestId: req._contestId,
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
    '/stages',
    {
      schema: {
        description: 'Update contest stages',
        response: { 200: Type.Array(SContestStage) }
      }
    },
    async (req) => {
      return req._contest.stages
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

      await contests.updateOne({ _id: req._contestId }, { $set: { stages, start, end } })
      return {}
    }
  )
})
