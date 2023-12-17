import { UserCapability, hasCapability } from '../../index.js'
import { loadUserCapability } from '../common/access.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { Type } from '@sinclair/typebox'
import { announcements, IAnnouncement } from '../../db/index.js'
import { BSON } from 'mongodb'
import { defineInjectionPoint } from '../../utils/inject.js'

const articleIdSchema = Type.Object({
  articleId: Type.String()
})

const kAnnouncementCtx = defineInjectionPoint<{
  _articleId: BSON.UUID
  _article: IAnnouncement
  _cap: boolean
}>('announcement')

export const announcementScopedRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(articleIdSchema))

  s.addHook('onRequest', async (req, rep) => {
    const articleId = loadUUID(req.params, 'articleId', s.httpErrors.notFound())
    const article = await announcements.findOne({ _id: articleId })
    if (!article) throw s.httpErrors.notFound()
    const _cap = req.user
      ? hasCapability(await loadUserCapability(req), UserCapability.CAP_ADMIN)
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
          200: Type.Object({
            title: Type.String(),
            description: Type.String(),
            public: Type.Boolean(),
            date: Type.String()
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
        body: Type.Object({
          title: Type.String(),
          description: Type.String(),
          public: Type.Boolean(),
          date: Type.String()
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
