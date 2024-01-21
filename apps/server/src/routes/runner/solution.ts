import { Type } from '@sinclair/typebox'
import {
  ContestRanklistState,
  SolutionState,
  contestParticipants,
  contests,
  problemStatuses,
  problems,
  solutions
} from '../../db/index.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { getDownloadUrl, problemDataKey, solutionDataKey, solutionDetailsKey } from '../../index.js'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { BSON } from 'mongodb'
import { problemConfigSchema } from '@aoi-js/common'
import { defineInjectionPoint } from '../../utils/inject.js'
import { kRunnerContext } from './inject.js'

const kRunnerSolutionContext = defineInjectionPoint<{
  _solutionId: BSON.UUID
  _taskId: BSON.UUID
}>('runnerSolution')

const runnerTaskRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        solutionId: Type.String({ format: 'uuid' }),
        taskId: Type.String({ format: 'uuid' })
      })
    )
  )

  s.addHook('onRequest', async (req) => {
    req.provide(kRunnerSolutionContext, {
      _solutionId: loadUUID(req.params, 'solutionId', s.httpErrors.notFound()),
      _taskId: loadUUID(req.params, 'taskId', s.httpErrors.notFound())
    })
  })

  s.patch(
    '/',
    {
      schema: {
        description: 'Update solution result',
        body: Type.Partial(
          Type.Object(
            {
              status: Type.String(),
              score: Type.Number({ minimum: 0, maximum: 100 }),
              metrics: Type.Record(Type.String(), Type.Number()),
              message: Type.String()
            },
            { additionalProperties: false }
          )
        ),
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerSolutionContext)
      const { matchedCount } = await solutions.updateOne(
        {
          _id: ctx._solutionId,
          taskId: ctx._taskId,
          state: { $in: [SolutionState.QUEUED, SolutionState.RUNNING] }
        },
        { $set: { state: SolutionState.RUNNING, ...req.body } }
      )
      if (matchedCount === 0) return rep.conflict()
      return {}
    }
  )

  s.register(getFileUrl, {
    prefix: '/details',
    resolve: async (type, query, req) => {
      const ctx = req.inject(kRunnerSolutionContext)
      const solution = await solutions.findOne(
        { _id: ctx._solutionId, taskId: ctx._taskId },
        { projection: { orgId: 1 } }
      )
      if (!solution) throw s.httpErrors.notFound()
      const oss = await loadOrgOssSettings(solution.orgId)
      if (!oss) throw s.httpErrors.notFound()
      return [await loadOrgOssSettings(solution.orgId), solutionDetailsKey(solution._id)]
    }
  })

  s.post(
    '/complete',
    {
      schema: {
        description: 'Mark solution as completed',
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerSolutionContext)
      const value = await solutions.findOneAndUpdate(
        {
          _id: ctx._solutionId,
          taskId: ctx._taskId,
          state: { $in: [SolutionState.QUEUED, SolutionState.RUNNING] }
        },
        // Since completedAt is only for reference,
        // use local time here
        { $set: { state: SolutionState.COMPLETED, completedAt: req._now } },
        { projection: { userId: 1, problemId: 1, contestId: 1, score: 1, status: 1 } }
      )
      if (!value) return rep.conflict()
      if (value.contestId) {
        const { modifiedCount } = await contestParticipants.updateOne(
          {
            userId: value.userId,
            contestId: value.contestId,
            [`results.${value.problemId}.lastSolutionId`]: value._id
          },
          [
            {
              $set: {
                [`results.${value.problemId}.lastSolution`]: {
                  _id: value._id,
                  score: value.score,
                  status: value.status,
                  completedAt: req._now
                },
                updatedAt: { $convert: { input: '$$NOW', to: 'double' } }
              }
            }
          ]
        )
        if (modifiedCount) {
          // update contest ranklist state
          await contests.updateOne(
            {
              _id: value.contestId,
              ranklists: { $exists: true, $ne: [] }
            },
            [
              {
                $set: {
                  ranklistUpdatedAt: { $convert: { input: '$$NOW', to: 'double' } },
                  ranklistState: ContestRanklistState.INVALID
                }
              }
            ]
          )
        }
      } else {
        // update problem status
        await problemStatuses.updateOne(
          {
            userId: value.userId,
            problemId: value.problemId,
            lastSolutionId: value._id
          },
          {
            $set: {
              lastSolutionScore: value.score,
              lastSolutionStatus: value.status
            }
          },
          { ignoreUndefined: true }
        )
      }
      return {}
    }
  )
})

export const runnerSolutionRoutes = defineRoutes(async (s) => {
  s.post(
    '/poll',
    {
      schema: {
        description: 'Poll for a new solution',
        response: {
          200: Type.Partial(
            Type.Object({
              taskId: Type.UUID(),
              solutionId: Type.UUID(),
              orgId: Type.UUID(),
              userId: Type.UUID(),
              contestId: Type.UUID(),
              problemConfig: problemConfigSchema,
              problemDataUrl: Type.String(),
              problemDataHash: Type.String(),
              solutionDataUrl: Type.String(),
              solutionDataHash: Type.String(),
              errMsg: Type.String()
            })
          )
        }
      }
    },
    async (req) => {
      const runnerCtx = req.inject(kRunnerContext)
      const taskId = new BSON.UUID()
      const solution = await solutions.findOneAndUpdate(
        {
          orgId: runnerCtx._runner.orgId,
          state: SolutionState.PENDING,
          label: { $in: runnerCtx._runner.labels }
        },
        { $set: { state: SolutionState.QUEUED, runnerId: runnerCtx._runner._id, taskId } }
      )
      if (!solution) return {}

      const info = {
        taskId,
        solutionId: solution._id,
        orgId: solution.orgId,
        userId: solution.userId,
        contestId: solution.contestId
      }

      const oss = await loadOrgOssSettings(runnerCtx._runner.orgId)
      if (!oss) return { ...info, errMsg: 'OSS not enabled' }
      const problem = await problems.findOne({ _id: solution.problemId })
      if (!problem) return { ...info, errMsg: 'Problem not found' }
      const currentData = problem.data.find(({ hash }) => hash === problem.currentDataHash)
      if (!currentData) return { ...info, errMsg: 'Problem data not found' }

      const problemDataUrl = await getDownloadUrl(
        oss,
        problemDataKey(problem._id, problem.currentDataHash)
      )
      const solutionDataUrl = await getDownloadUrl(oss, solutionDataKey(solution._id))

      return {
        ...info,
        problemConfig: currentData.config,
        problemDataUrl,
        problemDataHash: problem.currentDataHash,
        solutionDataUrl,
        solutionDataHash: solution.solutionDataHash
      }
    }
  )

  s.register(runnerTaskRoutes, { prefix: '/task/:solutionId/:taskId' })
})
