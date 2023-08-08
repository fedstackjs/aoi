import { Type } from '@sinclair/typebox'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { defineRoutes, paramSchemaMerger } from '../common/index.js'
import { ensureCapability } from '../../utils/index.js'
import { ProblemCapability, problems } from '../../db/index.js'
import { problemAttachmentKey } from '../../oss/index.js'
import { StrictObject } from '../../schemas/index.js'

const attachmentScopedRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(Type.Object({ key: Type.String() })))
  s.register(getFileUrl, {
    prefix: '/url',
    resolve: async (type, query, req) => {
      if (type !== 'download') {
        ensureCapability(
          req._problemCapability,
          ProblemCapability.CAP_CONTENT,
          s.httpErrors.forbidden()
        )
      }
      const oss = await loadOrgOssSettings(req._problem.orgId)
      const key = (req.params as { key: string }).key
      return [oss, problemAttachmentKey(req._problemId, key), query]
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

      const key = (req.params as { key: string }).key
      const { modifiedCount } = await problems.updateOne(
        { _id: req._problemId },
        { $pull: { attachments: { key } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})

export const attachmentRoutes = defineRoutes(async (s) => {
  s.get(
    '/',
    {
      schema: {
        description: 'Get problem attachments',
        response: {
          200: Type.Array(
            Type.Object({
              key: Type.String(),
              name: Type.String(),
              description: Type.String()
            })
          )
        }
      }
    },
    async (req) => {
      return req._problem.attachments
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create problem attachment',
        body: StrictObject({
          key: Type.String(),
          name: Type.String(),
          description: Type.String()
        })
      }
    },
    async (req, rep) => {
      ensureCapability(
        req._problemCapability,
        ProblemCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )

      const { key, name, description } = req.body
      const { modifiedCount } = await problems.updateOne(
        { _id: req._problemId, [`attachments.key`]: { $ne: key } },
        { $push: { attachments: { key, name, description } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.register(attachmentScopedRoutes, { prefix: '/:key' })
})
