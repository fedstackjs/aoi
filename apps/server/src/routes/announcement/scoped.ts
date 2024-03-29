import { BSON } from 'mongodb'

import { IAnnouncement, USER_CAPS } from '../../db/index.js'
import { T } from '../../schemas/index.js'
import { defineInjectionPoint, hasCapability } from '../../utils/index.js'
import { loadUserCapability, defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'

const articleIdSchema = T.Object({
  articleId: T.String()
})

const kAnnouncementCtx = defineInjectionPoint<{
  _articleId: BSON.UUID
  _article: IAnnouncement
  _cap: boolean
}>('announcement')

export const announcementScopedRoutes = defineRoutes(async (s) => {
  const { announcements } = s.db

  s.addHook('onRoute', paramSchemaMerger(articleIdSchema))

  s.addHook('onRequest', async (req, rep) => {
    const articleId = loadUUID(req.params, 'articleId', s.httpErrors.notFound())
    const article = await announcements.findOne({ _id: articleId })
    if (!article) throw s.httpErrors.notFound()
    const _cap = req.user
      ? hasCapability(await loadUserCapability(req), USER_CAPS.CAP_ADMIN)
      : false
    if (!article.public && !_cap) return rep.forbidden()
    req.provide(kAnnouncementCtx, {
      _articleId: articleId,
      _article: article,
      _cap: _cap
    })
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get article details',
        response: {
          200: T.Object({
            title: T.String(),
            description: T.String(),
            public: T.Boolean(),
            date: T.String()
          })
        },
        security: []
      }
    },
    async (req) => {
      const ctx = req.inject(kAnnouncementCtx)
      return {
        title: ctx._article.title,
        description: ctx._article.description,
        public: ctx._article.public,
        date: ctx._article.date
      }
    }
  )

  s.patch(
    '/',
    {
      schema: {
        description: 'Update article details',
        body: T.Object({
          title: T.String(),
          description: T.String(),
          public: T.Boolean(),
          date: T.String()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kAnnouncementCtx)
      if (!ctx._cap) return rep.forbidden()
      const { title, description, public: pub, date } = req.body
      await announcements.updateOne(
        { _id: ctx._articleId },
        { $set: { title, description, public: pub, date } }
      )
      return { ok: 1 }
    }
  )

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete article'
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kAnnouncementCtx)
      if (!ctx._cap) return rep.forbidden()
      await announcements.deleteOne({ _id: ctx._articleId })
      return {}
    }
  )
})
