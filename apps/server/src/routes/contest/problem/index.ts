import { Type } from '@sinclair/typebox'
import { defineRoutes, paramSchemaMerger, tryLoadUUID } from '../../common/index.js'
import { SContestProblemSettings } from '../../../schemas/contest.js'
import { BSON, Document } from 'mongodb'
import { problemConfigSchema } from '@aoi/common'
import { getFileUrl, loadOrgOssSettings } from '../../common/files.js'
import {
  ContestCapability,
  SolutionState,
  contestParticipants,
  problems,
  solutions
} from '../../../db/index.js'
import { TypeHash, TypeUUID } from '../../../schemas/index.js'
import { getUploadUrl, problemAttachmentKey, solutionDataKey } from '../../../oss/index.js'
import { hasCapability } from '../../../utils/index.js'
import { problemAdminRoutes } from './admin.js'
import { FastifyRequest } from 'fastify'

function loadProblemSettings(req: FastifyRequest) {
  const problemId = tryLoadUUID(req.params, 'problemId')
  if (!problemId) return [null, undefined] as const
  const settings = req._contest.problems.find((problem) => problemId.equals(problem.problemId))
    ?.settings
  return [problemId, settings] as const
}

const problemViewRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (hasCapability(req._contestCapability, ContestCapability.CAP_ADMIN)) return
    if (req._contestStage.settings.problemEnabled && req._contestParticipant) return
    return rep.forbidden()
  })

  s.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Array(
            Type.Object({
              _id: TypeUUID(),
              title: Type.String(),
              tags: Type.Optional(Type.Array(Type.String())),
              settings: Type.Pick(SContestProblemSettings, ['score', 'slug'] as const)
            })
          )
        }
      }
    },
    async (req) => {
      const config = req._contest.problems
      const $in = config
        .filter(({ settings }) => (settings.showAfter ?? 0) <= req._now)
        .map(({ problemId }) => problemId)
      const projection: Document = { title: 1 }
      if (req._contestStage.settings.problemShowTags) {
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
        params: Type.Object({
          problemId: Type.String()
        }),
        response: {
          200: Type.Object({
            _id: TypeUUID(),
            title: Type.String(),
            description: Type.String(),
            tags: Type.Optional(Type.Array(Type.String())),
            attachments: Type.Array(
              Type.Object({
                key: Type.String(),
                name: Type.String(),
                description: Type.String()
              })
            ),
            currentDataHash: Type.String(),
            config: Type.Optional(problemConfigSchema)
          })
        }
      }
    },
    async (req, rep) => {
      const [problemId, settings] = loadProblemSettings(req)
      if (!settings) return rep.notFound()
      if (settings.showAfter && settings.showAfter > req._now) return rep.notFound()
      const projection: Document = {
        title: 1,
        description: 1,
        attachments: 1,
        currentDataHash: 1,
        data: 1
      }
      if (req._contestStage.settings.problemShowTags) {
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
      s.addHook(
        'onRoute',
        paramSchemaMerger(Type.Object({ problemId: Type.String(), key: Type.String() }))
      )
      s.register(getFileUrl, {
        prefix: '/url',
        resolve: async (type, query, req) => {
          const [problemId, settings] = loadProblemSettings(req)
          if (!settings) throw s.httpErrors.notFound()
          if (settings.showAfter && settings.showAfter > req._now) throw s.httpErrors.notFound()

          const oss = await loadOrgOssSettings(req._contest.orgId)
          const key = (req.params as { key: string }).key
          return [oss, problemAttachmentKey(problemId, key), query]
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
        params: Type.Object({
          problemId: Type.String()
        }),
        body: Type.Object({
          hash: TypeHash(),
          size: Type.Integer()
        }),
        response: {
          200: Type.Object({
            solutionId: TypeUUID(),
            uploadUrl: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      if (!req._contestParticipant) return rep.forbidden()

      const oss = await loadOrgOssSettings(req._contest.orgId)
      if (!oss) return rep.preconditionFailed('OSS not configured')

      const [problemId, settings] = loadProblemSettings(req)
      if (!settings) return rep.notFound()
      if (settings.showAfter && settings.showAfter > req._now) return rep.notFound()

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

      const { value } = await solutions.findOneAndUpdate(
        {
          problemId,
          contestId: req._contestId,
          userId: req.user.userId,
          state: SolutionState.CREATED
        },
        {
          $set: {
            label: config.label,
            problemDataHash: currentDataHash,
            solutionDataHash: req.body.hash
          }
        }
      )
      if (value) {
        const uploadUrl = await getUploadUrl(oss, solutionDataKey(value._id), {
          expiresIn: 300,
          size: req.body.size
        })
        return { solutionId: value._id, uploadUrl }
      }

      const { modifiedCount } = await contestParticipants.updateOne(
        {
          _id: req._contestParticipant,
          $or: [
            { [`results.${problemId}`]: { $exists: false } },
            { [`results.${problemId}.solutionCount`]: { $lt: settings.solutionCountLimit } }
          ]
        },
        {
          $inc: { [`results.${problemId}.solutionCount`]: 1 }
        }
      )
      if (!modifiedCount) return rep.preconditionFailed('Solution limit reached')

      const { insertedId } = await solutions.insertOne({
        _id: new BSON.UUID(),
        orgId: req._contest.orgId,
        problemId,
        contestId: req._contestId,
        userId: req.user.userId,
        label: config.label,
        problemDataHash: problem.currentDataHash,
        state: SolutionState.CREATED,
        solutionDataHash: req.body.hash,
        score: 0,
        metrics: {},
        status: '',
        message: '',
        details: '',
        createdAt: req._now
      })
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
