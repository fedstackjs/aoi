import { BSON } from 'mongodb'
import { ContestRanklistState, SolutionState, contests, solutions } from '../../db/index.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { Type } from '@sinclair/typebox'
import { loadOrgOssSettings } from '../common/files.js'
import { contestRanklistKey, getUploadUrl } from '../../index.js'

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
    req._contestId = loadUUID(req.params, 'contestId', s.httpErrors.notFound())
    req._taskId = loadUUID(req.params, 'taskId', s.httpErrors.notFound())
  })

  s.post(
    '/complete',
    {
      schema: {
        description: 'Mark task as completed',
        body: Type.Object({
          ranklistLastSolutionId: Type.String({ format: 'uuid' })
        })
      }
    },
    async (req, rep) => {
      const { modifiedCount } = await contests.updateOne(
        { _id: req._contestId, ranklistTaskId: req._taskId },
        {
          $addFields: {
            ranklistState: {
              $cond: {
                if: {
                  $eq: ['$ranklistLastSolutionId', new BSON.UUID(req.body.ranklistLastSolutionId)]
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
      const contest = await contests.findOne(
        { _id: req._contestId, ranklistTaskId: req._taskId },
        { projection: { ranklists: 1 } }
      )
      if (!contest) return rep.notFound()
      const list = await solutions
        .find(
          {
            contestId: req._contestId,
            state: SolutionState.COMPLETED,
            completedAt: { $gt: req.query.since }
          },
          { limit: 50, projection: { taskId: 0 } }
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
              url: Type.String({ format: 'uri' })
            })
          )
        }
      }
    },
    async (req, rep) => {
      const contest = await contests.findOne(
        { _id: req._contestId, ranklistTaskId: req._taskId },
        { projection: { ranklists: 1, orgId: 1 } }
      )
      if (!contest) return rep.notFound()
      const oss = await loadOrgOssSettings(contest.orgId)
      if (!oss) return rep.preconditionFailed()
      const urls = contest.ranklists.map(async (r) => ({
        url: await getUploadUrl(oss, contestRanklistKey(req._contestId, r.key))
      }))
      return Promise.all(urls)
    }
  )
})

export const runnerRanklistRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (req._runner.labels.includes('ranklist')) {
      return rep.forbidden()
    }
  })

  s.register(runnerRanklistTaskRoutes, { prefix: '/task/:contestId/:taskId' })

  s.post('/poll', {}, async (req, rep) => {
    if (!req._runner.labels.includes('ranklist')) return rep.forbidden()
    const { value } = await contests.findOneAndUpdate(
      {
        orgId: req._runner.orgId,
        ranklistState: ContestRanklistState.INVALID,
        $or: [{ ranklistRunnerId: req._runner._id }, { ranklistRunnerId: { $exists: false } }]
      },
      {
        $set: {
          ranklistState: ContestRanklistState.PENDING,
          ranklistRunnerId: req._runner._id,
          ranklistTaskId: new BSON.UUID()
        }
      }
    )
    if (!value) return null
    //
  })
})
