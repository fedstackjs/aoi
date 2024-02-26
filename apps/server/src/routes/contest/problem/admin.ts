import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../../common/index.js'
import { SContestProblemSettings } from '../../../schemas/contest.js'
import { BSON } from 'mongodb'
import { CONTEST_CAPS, SolutionState, contests, problems, solutions } from '../../../db/index.js'
import { hasCapability } from '../../../utils/index.js'
import { kContestContext } from '../inject.js'
import { loadProblemSettings } from './common.js'

export const problemAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kContestContext)
    if (!hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)) {
      return rep.forbidden()
    }
  })

  s.post(
    '/',
    {
      schema: {
        body: Type.Object({
          problemId: Type.UUID(),
          settings: SContestProblemSettings
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)
      const problemId = new BSON.UUID(req.body.problemId)
      const exists = await problems.countDocuments({
        _id: problemId,
        orgId: ctx._contest.orgId
      })
      if (!exists) return rep.notFound()
      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId, 'problems.problemId': { $ne: problemId } },
        { $push: { problems: { problemId, settings: req.body.settings } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.get(
    '/:problemId/settings',
    {
      schema: {
        params: Type.Object({
          problemId: Type.UUID()
        }),
        response: { 200: SContestProblemSettings }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)
      const problem = ctx._contest.problems.find(({ problemId }) =>
        problemId.equals(req.params.problemId)
      )
      if (!problem) return rep.notFound()
      return problem.settings
    }
  )

  s.patch(
    '/:problemId/settings',
    {
      schema: {
        params: Type.Object({
          problemId: Type.UUID()
        }),
        body: SContestProblemSettings
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)
      const problemId = new BSON.UUID(req.params.problemId)
      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId, 'problems.problemId': problemId },
        { $set: { 'problems.$.settings': req.body } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )

  s.post(
    '/:problemId/submit-all',
    {
      schema: {
        description: 'Submit all solutions',
        params: Type.Object({
          problemId: Type.UUID()
        }),
        response: {
          200: Type.Object({
            modifiedCount: Type.Number()
          })
        }
      }
    },
    async (req) => {
      const { modifiedCount } = await solutions.updateMany(
        {
          contestId: req.inject(kContestContext)._contestId,
          problemId: new BSON.UUID(req.params.problemId),
          state: SolutionState.CREATED
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
        ]
      )
      return { modifiedCount }
    }
  )

  s.post(
    '/:problemId/rejudge-all',
    {
      schema: {
        description: 'Rejudge all solutions',
        params: Type.Object({
          problemId: Type.UUID()
        }),
        body: Type.Object({
          pull: Type.Optional(Type.Boolean())
        }),
        response: {
          200: Type.Object({
            modifiedCount: Type.Number()
          })
        }
      }
    },
    async (req, rep) => {
      const { pull } = req.body
      const [problemId, settings] = loadProblemSettings(req)
      if (!settings) return rep.notFound()
      const problem = await problems.findOne(
        { _id: problemId },
        { projection: { currentDataHash: 1, data: 1 } }
      )
      if (!problem) return rep.notFound()
      const { data, currentDataHash } = problem
      const currentData = data.find(({ hash }) => hash === currentDataHash)
      if (!currentData) return rep.preconditionFailed('Current data not found')
      const { config } = currentData

      const { modifiedCount } = await solutions.updateMany(
        {
          contestId: req.inject(kContestContext)._contestId,
          problemId: new BSON.UUID(req.params.problemId),
          state: { $ne: SolutionState.CREATED }
        },
        [
          {
            $set: {
              label: pull ? config.label : undefined,
              problemDataHash: pull ? currentDataHash : undefined,
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
      return { modifiedCount }
    }
  )

  s.delete(
    '/:problemId',
    {
      schema: {
        params: Type.Object({
          problemId: Type.UUID()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)
      const problemId = new BSON.UUID(req.params.problemId)
      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId },
        { $pull: { problems: { problemId } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})
