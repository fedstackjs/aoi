import { BSON } from 'mongodb'
import {
  ContestRanklistState,
  SolutionState,
  contestParticipants,
  contests,
  problems,
  solutions
} from '../../db/index.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { Type } from '@sinclair/typebox'
import { loadOrgOssSettings } from '../common/files.js'
import {
  SContestProblemSettings,
  SContestRanklistSettings,
  contestRanklistKey,
  getUploadUrl
} from '../../index.js'
import { defineInjectionPoint } from '../../utils/inject.js'
import { kRunnerContext } from './inject.js'

const kRunnerRanklistContext = defineInjectionPoint<{
  _contestId: BSON.UUID
  _taskId: BSON.UUID
}>('runnerRanklist')

const runnerRanklistTaskRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        contestId: Type.String({ format: 'uuid' }),
        taskId: Type.String({ format: 'uuid' })
      })
    )
  )

  s.addHook('onRequest', async (req) => {
    req.provide(kRunnerRanklistContext, {
      _contestId: loadUUID(req.params, 'contestId', s.httpErrors.notFound()),
      _taskId: loadUUID(req.params, 'taskId', s.httpErrors.notFound())
    })
  })

  s.post(
    '/complete',
    {
      schema: {
        description: 'Mark task as completed',
        body: Type.Object({
          ranklistUpdatedAt: Type.Integer()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerRanklistContext)

      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId, ranklistTaskId: ctx._taskId },
        {
          $addFields: {
            ranklistState: {
              $cond: {
                if: {
                  $eq: ['$ranklistUpdatedAt', req.body.ranklistUpdatedAt]
                },
                then: ContestRanklistState.VALID,
                else: ContestRanklistState.INVALID
              }
            }
          }
        }
      )
      if (modifiedCount === 0) return rep.notFound()
      return {}
    }
  )

  s.get(
    '/problems',
    {
      schema: {
        response: {
          200: Type.Array(
            Type.Object({
              _id: Type.UUID(),
              title: Type.String(),
              tags: Type.Array(Type.String()),
              settings: SContestProblemSettings
            })
          )
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerRanklistContext)

      const contest = await contests.findOne(
        { _id: ctx._contestId, ranklistTaskId: ctx._taskId },
        { projection: { problems: 1 } }
      )
      if (!contest) return rep.notFound()
      const config = contest.problems
      const $in = config.map(({ problemId }) => problemId)
      const list = await problems
        .find({ _id: { $in } }, { projection: { title: 1, tags: 1 } })
        .toArray()
      return list.map((problem) => ({
        ...problem,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        settings: config.find(({ problemId }) => problemId.equals(problem._id))!.settings
      }))
    }
  )

  s.get(
    '/participants',
    {
      schema: {
        description: 'Get participants for contest',
        querystring: Type.Object({
          since: Type.Number()
        }),
        response: {
          200: Type.Array(
            Type.Object({
              _id: Type.UUID(),
              userId: Type.UUID(),
              contestId: Type.UUID(),
              tags: Type.Optional(Type.Array(Type.String())),
              results: Type.Record(
                Type.String(),
                Type.Object({
                  solutionCount: Type.Integer(),
                  lastSolutionId: Type.UUID(),
                  lastSolution: Type.Object({
                    score: Type.Number(),
                    status: Type.String(),
                    completedAt: Type.Integer()
                  })
                })
              ),
              updatedAt: Type.Integer()
            })
          )
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerRanklistContext)

      const contest = await contests.findOne(
        { _id: ctx._contestId, ranklistTaskId: ctx._taskId },
        { projection: { ranklists: 1 } }
      )
      if (!contest) return rep.notFound()
      const list = await contestParticipants
        .find(
          {
            contestId: ctx._contestId,
            updatedAt: { $gt: req.query.since }
          },
          { limit: 50, sort: { updatedAt: 1 } }
        )
        .toArray()
      return list
    }
  )

  s.get(
    '/solutions',
    {
      schema: {
        description: 'Get solutions for contest',
        querystring: Type.Object({
          since: Type.Number()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerRanklistContext)

      const contest = await contests.findOne(
        { _id: ctx._contestId, ranklistTaskId: ctx._taskId },
        { projection: { ranklists: 1 } }
      )
      if (!contest) return rep.notFound()
      const list = await solutions
        .find(
          {
            contestId: ctx._contestId,
            state: SolutionState.COMPLETED,
            completedAt: { $gt: req.query.since }
          },
          { limit: 50, projection: { taskId: 0 }, sort: { completedAt: 1 } }
        )
        .toArray()
      return list
    }
  )

  s.get(
    '/uploadUrls',
    {
      schema: {
        description: 'Get upload urls for ranklist',
        response: {
          200: Type.Array(
            Type.Object({
              key: Type.String(),
              url: Type.String({ format: 'uri' })
            })
          )
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerRanklistContext)

      const contest = await contests.findOne(
        { _id: ctx._contestId, ranklistTaskId: ctx._taskId },
        { projection: { ranklists: 1, orgId: 1 } }
      )
      if (!contest) return rep.notFound()
      const oss = await loadOrgOssSettings(contest.orgId)
      if (!oss) return rep.preconditionFailed()
      const urls = contest.ranklists.map(async ({ key }) => ({
        key,
        url: await getUploadUrl(oss, contestRanklistKey(ctx._contestId, key))
      }))
      return Promise.all(urls)
    }
  )
})

export const runnerRanklistRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (!req.inject(kRunnerContext)._runner.labels.includes('ranker')) {
      return rep.forbidden()
    }
  })

  s.register(runnerRanklistTaskRoutes, { prefix: '/task/:contestId/:taskId' })

  s.post(
    '/poll',
    {
      schema: {
        response: {
          200: Type.Partial(
            Type.Object({
              taskId: Type.UUID(),
              contestId: Type.UUID(),
              ranklists: Type.Array(
                Type.Object({
                  key: Type.String(),
                  name: Type.String(),
                  settings: SContestRanklistSettings
                })
              ),
              ranklistUpdatedAt: Type.Integer()
            })
          )
        }
      }
    },
    async (req) => {
      const runnerCtx = req.inject(kRunnerContext)
      const value = await contests.findOneAndUpdate(
        {
          orgId: runnerCtx._runner.orgId,
          ranklistState: ContestRanklistState.INVALID,
          $or: [
            { ranklistRunnerId: runnerCtx._runner._id },
            { ranklistRunnerId: { $exists: false } }
          ]
        },
        {
          $set: {
            ranklistState: ContestRanklistState.PENDING,
            ranklistRunnerId: runnerCtx._runner._id,
            ranklistTaskId: new BSON.UUID()
          }
        },
        { returnDocument: 'after' }
      )
      if (!value) return {}
      return {
        taskId: value.ranklistTaskId,
        contestId: value._id,
        ranklists: value.ranklists,
        ranklistUpdatedAt: value.ranklistUpdatedAt
      }
    }
  )
})
