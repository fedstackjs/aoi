import { BSON, UUID } from 'mongodb'

import { ContestRanklistState, SolutionState } from '../../db/index.js'
import {
  SContestProblemSettings,
  SContestRanklistSettings,
  contestRanklistKey,
  getUploadUrl
} from '../../index.js'
import { T } from '../../schemas/index.js'
import { defineInjectionPoint } from '../../utils/inject.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'

import { kRunnerContext } from './inject.js'

const kRunnerRanklistContext = defineInjectionPoint<{
  _contestId: BSON.UUID
  _taskId: BSON.UUID
}>('runnerRanklist')

const runnerRanklistTaskRoutes = defineRoutes(async (s) => {
  const { contests, problems, contestParticipants, solutions, orgs } = s.db

  s.addHook(
    'onRoute',
    paramSchemaMerger(
      T.Object({
        contestId: T.String({ format: 'uuid' }),
        taskId: T.String({ format: 'uuid' })
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
        body: T.Object({
          ranklistUpdatedAt: T.Integer()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kRunnerRanklistContext)

      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId, ranklistTaskId: ctx._taskId },
        [
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
        ]
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
          200: T.Array(
            T.Object({
              _id: T.UUID(),
              title: T.String(),
              tags: T.Array(T.String()),
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
        querystring: T.Object({
          since: T.Number(),
          lastId: T.UUID()
        }),
        response: {
          200: T.Array(
            T.Object({
              _id: T.UUID(),
              userId: T.UUID(),
              contestId: T.UUID(),
              tags: T.Optional(T.Array(T.String())),
              results: T.Record(
                T.String(),
                T.Object({
                  solutionCount: T.Integer(),
                  lastSolutionId: T.UUID(),
                  lastSolution: T.Object({
                    score: T.Number(),
                    status: T.String(),
                    completedAt: T.Integer()
                  })
                })
              ),
              updatedAt: T.Integer()
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
            $or: [
              { updatedAt: { $gt: req.query.since } },
              { updatedAt: req.query.since, _id: { $gt: new UUID(req.query.lastId) } }
            ]
          },
          { limit: 50, sort: { updatedAt: 1, _id: 1 } }
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
        querystring: T.Object({
          since: T.Number(),
          lastId: T.UUID()
        }),
        response: {
          200: T.Array(
            T.Object({
              _id: T.UUID(),
              problemId: T.UUID(),
              userId: T.UUID(),
              label: T.String(),
              problemDataHash: T.String(),
              state: T.Integer(),
              solutionDataHash: T.String(),
              score: T.Number(),
              metrics: T.Record(T.String(), T.Number()),
              status: T.String(),
              message: T.String(),
              createdAt: T.Integer(),
              submittedAt: T.Integer(),
              completedAt: T.Integer()
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
      const list = await solutions
        .find(
          {
            contestId: ctx._contestId,
            state: SolutionState.COMPLETED,
            $or: [
              { completedAt: { $gt: req.query.since } },
              { completedAt: req.query.since, _id: { $gt: new UUID(req.query.lastId) } }
            ]
          },
          { limit: 50, projection: { taskId: 0 }, sort: { completedAt: 1, _id: 1 } }
        )
        .toArray()
      // Since state is COMPLETED, we can safely cast to the correct type
      return list as Array<(typeof list)[number] & { submittedAt: number; completedAt: number }>
    }
  )

  s.get(
    '/uploadUrls',
    {
      schema: {
        description: 'Get upload urls for ranklist',
        response: {
          200: T.Array(
            T.Object({
              key: T.String(),
              url: T.String({ format: 'uri' })
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
      const org = await orgs.findOne({ _id: contest.orgId })
      const oss = org?.settings.oss
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
  const { contests } = s.db

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
          200: T.Partial(
            T.Object({
              taskId: T.UUID(),
              contestId: T.UUID(),
              ranklists: T.Array(
                T.Object({
                  key: T.String(),
                  name: T.String(),
                  settings: SContestRanklistSettings
                })
              ),
              ranklistUpdatedAt: T.Integer()
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
