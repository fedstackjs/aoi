import { Type } from '@sinclair/typebox'
import {
  ContestRanklistState,
  SolutionState,
  contests,
  problemStatuses,
  problems,
  solutions
} from '../../db/index.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { getDownloadUrl, problemDataKey, solutionDataKey, solutionDetailsKey } from '../../index.js'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { BSON } from 'mongodb'
import { problemConfigSchema } from '@aoi/common'

declare module 'fastify' {
  interface FastifyRequest {
    _solutionId: BSON.UUID
    _taskId: BSON.UUID
  }
}

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
    req._solutionId = loadUUID(req.params, 'solutionId', s.httpErrors.notFound())
    req._taskId = loadUUID(req.params, 'taskId', s.httpErrors.notFound())
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
      const { matchedCount } = await solutions.updateOne(
        {
          _id: req._solutionId,
          taskId: req._taskId,
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
      const solution = await solutions.findOne(
        { _id: req._solutionId, taskId: req._taskId },
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
      const { value } = await solutions.findOneAndUpdate(
        {
          _id: req._solutionId,
          taskId: req._taskId,
          state: { $in: [SolutionState.QUEUED, SolutionState.RUNNING] }
        },
        { $set: { state: SolutionState.COMPLETED, completedAt: Date.now() } },
        { projection: { userId: 1, problemId: 1, contestId: 1, score: 1, status: 1 } }
      )
      if (!value) return rep.conflict()
      if (value.contestId) {
        // update contest ranklist state
        await contests.updateOne(
          { _id: value.contestId },
          {
            $set: {
              ranklistLastSolutionId: value._id,
              ranklistState: ContestRanklistState.INVALID
            }
          }
        )
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
      const taskId = new BSON.UUID()
      const { value: solution } = await solutions.findOneAndUpdate(
        {
          orgId: req._runner.orgId,
          state: SolutionState.PENDING,
          label: { $in: req._runner.labels }
        },
        { $set: { state: SolutionState.QUEUED, runnerId: req._runner._id, taskId } }
      )
      if (!solution) return {}

      const info = { taskId, solutionId: solution._id }

      const oss = await loadOrgOssSettings(req._runner.orgId)
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
