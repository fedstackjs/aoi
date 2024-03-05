import { SProblemConfigSchema } from '@aoi-js/common'
import { PROBLEM_CAPS, problems } from '../../db/index.js'
import { problemDataKey } from '../../oss/index.js'
import { ensureCapability } from '../../utils/index.js'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { defineRoutes, paramSchemaMerger } from '../common/index.js'
import { Type } from '@sinclair/typebox'
import { kProblemContext } from './inject.js'

const dataScopedRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(Type.Object({ hash: Type.Hash() })))
  s.register(getFileUrl, {
    prefix: '/url',
    resolve: async (_type, query, req) => {
      const ctx = req.inject(kProblemContext)
      const oss = await loadOrgOssSettings(ctx._problem.orgId)
      const hash = (req.params as { hash: string }).hash
      return [oss, problemDataKey(ctx._problemId, hash), query]
    }
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete problem attachment',
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kProblemContext)

      ensureCapability(ctx._problemCapability, PROBLEM_CAPS.CAP_CONTENT, s.httpErrors.forbidden())
      const hash = (req.params as { hash: string }).hash
      const { modifiedCount } = await problems.updateOne(
        { _id: ctx._problemId, currentDataHash: { $ne: hash } },
        { $pull: { data: { hash } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )
})

export const problemDataRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    ensureCapability(
      req.inject(kProblemContext)._problemCapability,
      PROBLEM_CAPS.CAP_DATA,
      s.httpErrors.forbidden()
    )
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get problem data',
        response: {
          200: Type.Array(
            Type.Object({
              hash: Type.Hash(),
              createdAt: Type.Number(),
              config: SProblemConfigSchema,
              description: Type.String()
            })
          )
        }
      }
    },
    async (req) => {
      return req.inject(kProblemContext)._problem.data
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create problem data',
        body: Type.Object({
          hash: Type.Hash(),
          config: SProblemConfigSchema,
          description: Type.String()
        })
      }
    },
    async (req, rep) => {
      const { hash, config, description } = req.body
      const { modifiedCount } = await problems.updateOne(
        { _id: req.inject(kProblemContext)._problemId, [`data.hash`]: { $ne: hash } },
        { $push: { data: { hash, createdAt: Date.now(), config, description } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.post(
    '/setDataHash',
    {
      schema: {
        description: 'Set problem data hash',
        body: Type.Object({
          hash: Type.Hash()
        })
      }
    },
    async (req, rep) => {
      const { hash } = req.body
      const { modifiedCount } = await problems.updateOne(
        { _id: req.inject(kProblemContext)._problemId, [`data.hash`]: hash },
        { $set: { currentDataHash: hash } }
      )
      if (!modifiedCount) return rep.badRequest()
      return {}
    }
  )

  s.register(dataScopedRoutes, { prefix: '/:hash' })
})
