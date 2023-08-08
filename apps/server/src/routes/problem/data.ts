import { problemConfigSchema } from '@aoi/common'
import { ProblemCapability, problems } from '../../db/index.js'
import { problemDataKey } from '../../oss/index.js'
import { StrictObject, TypeHash } from '../../schemas/index.js'
import { ensureCapability } from '../../utils/index.js'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { defineRoutes, paramSchemaMerger } from '../common/index.js'
import { Type } from '@sinclair/typebox'

const dataScopedRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(Type.Object({ hash: TypeHash() })))
  s.register(getFileUrl, {
    prefix: '/url',
    resolve: async (_type, query, req) => {
      const oss = await loadOrgOssSettings(req._problem.orgId)
      const hash = (req.params as { hash: string }).hash
      return [oss, problemDataKey(req._problemId, hash), query]
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
      ensureCapability(
        req._problemCapability,
        ProblemCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )
      const hash = (req.params as { hash: string }).hash
      const { modifiedCount } = await problems.updateOne(
        { _id: req._problemId, currentDataHash: { $ne: hash } },
        { $pull: { data: { hash } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )
})

export const dataRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    ensureCapability(req._problemCapability, ProblemCapability.CAP_DATA, s.httpErrors.forbidden())
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get problem data',
        response: {
          200: Type.Array(
            Type.Object({
              hash: TypeHash(),
              createdAt: Type.Number(),
              config: problemConfigSchema,
              description: Type.String()
            })
          )
        }
      }
    },
    async (req) => {
      return req._problem.data
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create problem data',
        body: StrictObject({
          hash: TypeHash(),
          config: problemConfigSchema,
          description: Type.String()
        })
      }
    },
    async (req, rep) => {
      const { hash, config, description } = req.body
      const { modifiedCount } = await problems.updateOne(
        { _id: req._problemId, [`data.hash`]: { $ne: hash } },
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
        body: StrictObject({
          hash: TypeHash()
        })
      }
    },
    async (req, rep) => {
      const { hash } = req.body
      const { modifiedCount } = await problems.updateOne(
        { _id: req._problemId, [`data.hash`]: hash },
        { $set: { currentDataHash: hash } }
      )
      if (!modifiedCount) return rep.badRequest()
      return {}
    }
  )

  s.register(dataScopedRoutes, { prefix: '/:hash' })
})
