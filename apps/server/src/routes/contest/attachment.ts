import { CONTEST_CAPS } from '../../index.js'
import { contestAttachmentKey } from '../../oss/index.js'
import { T } from '../../schemas/index.js'
import { ensureCapability } from '../../utils/index.js'
import { getFileUrl, defineRoutes, paramSchemaMerger } from '../common/index.js'

import { kContestContext } from './inject.js'

const attachmentScopedRoutes = defineRoutes(async (s) => {
  const { contests } = s.db

  s.addHook('onRoute', paramSchemaMerger(T.Object({ key: T.String() })))
  s.register(getFileUrl, {
    prefix: '/url',
    resolve: async (type, query, req) => {
      const ctx = req.inject(kContestContext)
      if (type !== 'download') {
        ensureCapability(ctx._contestCapability, CONTEST_CAPS.CAP_CONTENT, s.httpErrors.forbidden())
      }
      const key = (req.params as { key: string }).key
      return [ctx._contest.orgId, contestAttachmentKey(ctx._contestId, key), query]
    }
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete contest attachment',
        response: {
          200: T.Object({})
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)
      ensureCapability(ctx._contestCapability, CONTEST_CAPS.CAP_CONTENT, s.httpErrors.forbidden())

      const key = (req.params as { key: string }).key
      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId },
        { $pull: { attachments: { key } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})

export const contestAttachmentRoutes = defineRoutes(async (s) => {
  const { contests } = s.db

  s.get(
    '/',
    {
      schema: {
        description: 'Get contest attachments',
        response: {
          200: T.Array(
            T.Object({
              key: T.String(),
              name: T.String(),
              description: T.String()
            })
          )
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kContestContext)
      return ctx._contest.attachments
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create contest attachment',
        body: T.Object({
          key: T.String(),
          name: T.String(),
          description: T.String()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)
      ensureCapability(ctx._contestCapability, CONTEST_CAPS.CAP_CONTENT, s.httpErrors.forbidden())

      const { key, name, description } = req.body
      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId, [`attachments.key`]: { $ne: key } },
        { $push: { attachments: { key, name, description } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.register(attachmentScopedRoutes, { prefix: '/:key' })
})
