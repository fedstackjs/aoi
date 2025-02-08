import { SProblemConfigSchema } from '@aoi-js/common'
import { BSON, Document } from 'mongodb'

import { CONTEST_CAPS, SolutionState } from '../../../db/index.js'
import { getUploadUrl, problemAttachmentKey, solutionDataKey } from '../../../oss/index.js'
import { SContestProblemSettings } from '../../../schemas/contest.js'
import { T } from '../../../schemas/index.js'
import { hasCapability } from '../../../utils/index.js'
import { getFileUrl } from '../../common/files.js'
import { defineRoutes, paramSchemaMerger } from '../../common/index.js'
import { kContestContext } from '../inject.js'

import { problemAdminRoutes } from './admin.js'
import { loadProblemSettings } from './common.js'

const problemViewRoutes = defineRoutes(async (s) => {
  const { contestParticipants, problems, solutions, orgs } = s.db

  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kContestContext)
    if (hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)) return
    if (ctx._contestStage.settings.problemEnabled && ctx._contestParticipant) return
    return rep.forbidden()
  })

  s.get(
    '/',
    {
      schema: {
        response: {
          200: T.Array(
            T.Object({
              _id: T.UUID(),
              title: T.String(),
              tags: T.Optional(T.Array(T.String())),
              settings: SContestProblemSettings
            })
          )
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kContestContext)
      let config = ctx._contest.problems
      if (!hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)) {
        config = config.filter(({ settings }) => (settings.showAfter ?? 0) <= req._now)
      }
      const $in = config.map(({ problemId }) => problemId)
      const projection: Document = { title: 1 }
      if (ctx._contestStage.settings.problemShowTags) {
        projection.tags = 1
      }
      const list = await problems.find({ _id: { $in } }, { projection }).toArray()
      return list.map((problem) => ({
        ...problem,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        settings: config.find(({ problemId }) => problemId.equals(problem._id))!.settings
      }))
    }
  )

  s.get(
    '/:problemId',
    {
      schema: {
        params: T.Object({
          problemId: T.String()
        }),
        response: {
          200: T.Object({
            _id: T.UUID(),
            title: T.String(),
            description: T.String(),
            tags: T.Optional(T.Array(T.String())),
            attachments: T.Array(
              T.Object({
                key: T.String(),
                name: T.String(),
                description: T.String()
              })
            ),
            currentDataHash: T.String(),
            config: T.Optional(SProblemConfigSchema)
          })
        }
      }
    },
    async (req, rep) => {
      const [problemId, settings] = loadProblemSettings(req)
      if (!settings) return rep.notFound()
      const ctx = req.inject(kContestContext)
      if (
        !hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN) &&
        settings.showAfter &&
        settings.showAfter > req._now
      )
        return rep.notFound()

      const projection: Document = {
        title: 1,
        description: 1,
        attachments: 1,
        currentDataHash: 1,
        data: 1
      }
      if (ctx._contestStage.settings.problemShowTags) {
        projection.tags = 1
      }
      const problem = await problems.findOne({ _id: problemId }, { projection })
      if (!problem) return rep.notFound()
      return {
        ...problem,
        config: problem.data.find(({ hash }) => hash === problem.currentDataHash)?.config
      }
    }
  )

  s.register(
    async (s) => {
      s.addHook('onRoute', paramSchemaMerger(T.Object({ problemId: T.String(), key: T.String() })))
      s.register(getFileUrl, {
        prefix: '/url',
        resolve: async (type, query, req) => {
          const ctx = req.inject(kContestContext)
          const [problemId, settings] = loadProblemSettings(req)
          if (!settings) throw s.httpErrors.notFound()
          if (
            !hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN) &&
            settings.showAfter &&
            settings.showAfter > req._now
          )
            throw s.httpErrors.notFound()

          const key = (req.params as { key: string }).key
          return [ctx._contest.orgId, problemAttachmentKey(problemId, key), query]
        },
        allowedTypes: ['download']
      })
    },
    { prefix: '/:problemId/attachment/:key' }
  )

  s.post(
    '/:problemId/solution',
    {
      schema: {
        description: 'Create a solution',
        params: T.Object({
          problemId: T.String()
        }),
        body: T.Object({
          hash: T.Hash(),
          size: T.Integer(),
          preferPrivate: T.Optional(T.Boolean())
        }),
        response: {
          200: T.Object({
            solutionId: T.UUID(),
            uploadUrl: T.String()
          })
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)
      if (!ctx._contestParticipant) return rep.forbidden()
      const { solutionEnabled, problemAllowCreateSolution } = ctx._contestStage.settings
      // Check for contest settings
      if (
        !(solutionEnabled && problemAllowCreateSolution) &&
        !hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)
      ) {
        return rep.forbidden()
      }

      // Check for problem settings
      const [problemId, settings] = loadProblemSettings(req)
      if (!settings) {
        return rep.notFound()
      }
      if (
        !hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN) &&
        settings.showAfter &&
        settings.showAfter > req._now
      ) {
        return rep.notFound()
      }
      if (settings.disableCreateSolution) {
        return rep.forbidden()
      }

      const org = await orgs.findOne(
        { _id: ctx._contest.orgId },
        { projection: { 'settings.oss': 1 } }
      )
      const oss = org?.settings.oss
      if (!oss) return rep.preconditionFailed('OSS not configured')

      const problem = await problems.findOne(
        { _id: problemId },
        { projection: { currentDataHash: 1, data: 1 } }
      )
      if (!problem) return rep.notFound()
      const { data, currentDataHash } = problem
      const currentData = data.find(({ hash }) => hash === currentDataHash)
      if (!currentData) return rep.preconditionFailed('Current data not found')
      const { config } = currentData

      const maxSize = config.solution?.maxSize ?? 1024 * 1024 * 10 // 10MiB
      if (req.body.size > maxSize) return rep.badRequest('Solution too large')

      const value = await solutions.findOneAndUpdate(
        {
          problemId,
          contestId: ctx._contestId,
          userId: req.user.userId,
          state: SolutionState.CREATED
        },
        {
          $set: {
            label: config.label,
            problemDataHash: currentDataHash,
            solutionDataHash: req.body.hash,
            preferPrivate: req.body.preferPrivate
          }
        },
        { returnDocument: 'after', ignoreUndefined: true }
      )
      if (value) {
        const uploadUrl = await getUploadUrl(oss, solutionDataKey(value._id), {
          expiresIn: 300,
          size: req.body.size
        })
        return { solutionId: value._id, uploadUrl }
      }

      const newSolutionId = new BSON.UUID()
      const { modifiedCount } = await contestParticipants.updateOne(
        {
          _id: ctx._contestParticipant._id,
          $or: [
            { [`results.${problemId}`]: { $exists: false } },
            { [`results.${problemId}.solutionCount`]: { $lt: settings.solutionCountLimit } }
          ]
        },
        {
          $inc: { [`results.${problemId}.solutionCount`]: 1 },
          $set: {
            [`results.${problemId}.lastSolutionId`]: newSolutionId,
            [`results.${problemId}.lastSolution`]: { score: 0, status: '', completedAt: 0 }
          }
        }
      )
      if (!modifiedCount) return rep.preconditionFailed('Solution limit reached')

      const { insertedId } = await solutions.insertOne(
        {
          _id: newSolutionId,
          orgId: ctx._contest.orgId,
          problemId,
          contestId: ctx._contestId,
          userId: req.user.userId,
          label: config.label,
          problemDataHash: problem.currentDataHash,
          state: SolutionState.CREATED,
          solutionDataHash: req.body.hash,
          score: 0,
          metrics: {},
          status: '',
          message: '',
          // createdAt is only a reference time,
          // so use local time here
          createdAt: req._now,
          preferPrivate: req.body.preferPrivate
        },
        { ignoreUndefined: true }
      )
      const uploadUrl = await getUploadUrl(oss, solutionDataKey(insertedId), {
        expiresIn: 300,
        size: req.body.size
      })
      return { solutionId: insertedId, uploadUrl }
    }
  )
})

export const contestProblemRoutes = defineRoutes(async (s) => {
  s.register(problemAdminRoutes)
  s.register(problemViewRoutes)
})
