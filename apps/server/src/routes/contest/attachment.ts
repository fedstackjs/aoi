import { Type } from '@sinclair/typebox'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import { defineRoutes, paramSchemaMerger } from '../common/index.js'
import { ensureCapability } from '../../utils/index.js'
import { contestAttachmentKey } from '../../oss/index.js'
import { StrictObject } from '../../schemas/index.js'
import { ContestCapability, contests } from '../../index.js'

const attachmentScopedRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(Type.Object({ key: Type.String() })))
  s.register(getFileUrl, {
    prefix: '/url',
    resolve: async (type, query, req) => {
      if (type !== 'download') {
        ensureCapability(
          req._contestCapability,
          ContestCapability.CAP_CONTENT,
          s.httpErrors.forbidden()
        )
      }
      const oss = await loadOrgOssSettings(req._contest.orgId)
      const key = (req.params as { key: string }).key
      return [oss, contestAttachmentKey(req._contestId, key), query]
    }
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete contest attachment',
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      ensureCapability(
        req._contestCapability,
        ContestCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )

      const key = (req.params as { key: string }).key
      const { modifiedCount } = await contests.updateOne(
        { _id: req._contestId },
        { $pull: { attachments: { key } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})

export const contestAttachmentRoutes = defineRoutes(async (s) => {
  s.get(
    '/',
    {
      schema: {
        description: 'Get contest attachments',
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
      return req._contest.attachments
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create contest attachment',
        body: StrictObject({
          key: Type.String(),
          name: Type.String(),
          description: Type.String()
        })
      }
    },
    async (req, rep) => {
      ensureCapability(
        req._contestCapability,
        ContestCapability.CAP_CONTENT,
        s.httpErrors.forbidden()
      )

      const { key, name, description } = req.body
      const { modifiedCount } = await contests.updateOne(
        { _id: req._contestId, [`attachments.key`]: { $ne: key } },
        { $push: { attachments: { key, name, description } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.register(attachmentScopedRoutes, { prefix: '/:key' })
})
