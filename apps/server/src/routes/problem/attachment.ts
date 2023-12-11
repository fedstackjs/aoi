import { Type } from '@sinclair/typebox'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { defineRoutes, paramSchemaMerger } from '../common/index.js'
import { ensureCapability } from '../../utils/index.js'
import { ProblemCapability, problems } from '../../db/index.js'
import { problemAttachmentKey } from '../../oss/index.js'
import { kProblemContext } from './inject.js'

const attachmentScopedRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(Type.Object({ key: Type.String() })))
  s.register(getFileUrl, {
    prefix: '/url',
    resolve: async (type, query, req) => {
      const ctx = req.inject(kProblemContext)

      if (type !== 'download') {
        ensureCapability(
          ctx._problemCapability,
          ProblemCapability.CAP_CONTENT,
          s.httpErrors.forbidden()
        )
      }
      const oss = await loadOrgOssSettings(ctx._problem.orgId)
      const key = (req.params as { key: string }).key
      return [oss, problemAttachmentKey(ctx._problemId, key), query]
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

      ensureCapability(
        ctx._problemCapability,
        ProblemCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )

      const key = (req.params as { key: string }).key
      const { modifiedCount } = await problems.updateOne(
        { _id: ctx._problemId },
        { $pull: { attachments: { key } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})

export const problemAttachmentRoutes = defineRoutes(async (s) => {
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
      const ctx = req.inject(kProblemContext)

      return ctx._problem.attachments
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create problem attachment',
        body: Type.Object({
          key: Type.String(),
          name: Type.String(),
          description: Type.String()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kProblemContext)

      ensureCapability(
        ctx._problemCapability,
        ProblemCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )

      const { key, name, description } = req.body
      const { modifiedCount } = await problems.updateOne(
        { _id: ctx._problemId, [`attachments.key`]: { $ne: key } },
        { $push: { attachments: { key, name, description } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.register(attachmentScopedRoutes, { prefix: '/:key' })
})
