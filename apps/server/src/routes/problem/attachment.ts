import { PROBLEM_CAPS } from '../../db/index.js'
import { problemAttachmentKey } from '../../oss/index.js'
import { T } from '../../schemas/index.js'
import { ensureCapability } from '../../utils/index.js'
import { getFileUrl } from '../common/files.js'
import { defineRoutes, paramSchemaMerger } from '../common/index.js'

import { kProblemContext } from './inject.js'

const attachmentScopedRoutes = defineRoutes(async (s) => {
  const { problems } = s.db

  s.addHook('onRoute', paramSchemaMerger(T.Object({ key: T.String() })))
  s.register(getFileUrl, {
    prefix: '/url',
    resolve: async (type, query, req) => {
      const ctx = req.inject(kProblemContext)

      if (type !== 'download') {
        ensureCapability(ctx._problemCapability, PROBLEM_CAPS.CAP_CONTENT, s.httpErrors.forbidden())
      }
      const key = (req.params as { key: string }).key
      return [ctx._problem.orgId, problemAttachmentKey(ctx._problemId, key), query]
    }
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete problem attachment',
        response: {
          200: T.Object({})
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kProblemContext)

      ensureCapability(ctx._problemCapability, PROBLEM_CAPS.CAP_CONTENT, s.httpErrors.forbidden())

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
  const { problems } = s.db

  s.get(
    '/',
    {
      schema: {
        description: 'Get problem attachments',
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
      const ctx = req.inject(kProblemContext)

      return ctx._problem.attachments
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create problem attachment',
        body: T.Object({
          key: T.String(),
          name: T.String(),
          description: T.String()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kProblemContext)

      ensureCapability(ctx._problemCapability, PROBLEM_CAPS.CAP_CONTENT, s.httpErrors.forbidden())

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
