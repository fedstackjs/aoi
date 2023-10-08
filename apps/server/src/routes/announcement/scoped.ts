import { UserCapability, hasCapability } from '../../index.js'
import { loadUserCapability } from '../common/access.js'
import { defineRoutes, loadUUID, paramSchemaMerger } from '../common/index.js'
import { Type } from '@sinclair/typebox'
import { announcements, IAnnouncement } from '../../db/index.js'
import { BSON } from 'mongodb'

const articleIdSchema = Type.Object({
  articleId: Type.String()
})

declare module 'fastify' {
  interface FastifyRequest {
    _articleId: BSON.UUID
    _article: IAnnouncement
    _cap: boolean
  }
}

export const announcementScopedRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', paramSchemaMerger(articleIdSchema))

  s.addHook('onRequest', async (req, rep) => {
    const articleId = loadUUID(req.params, 'articleId', s.httpErrors.notFound())
    const article = await announcements.findOne({ _id: articleId })
    if (!article) throw s.httpErrors.notFound()
    req._cap = await (async () => {
      if (!req.user) return false
      const capability = await loadUserCapability(req)
      return hasCapability(capability, UserCapability.CAP_ADMIN)
    })()
    if (!article.public && !req._cap) return rep.forbidden()
    req._articleId = articleId
    req._article = article
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
      return {
        title: req._article.title,
        description: req._article.description,
        public: req._article.public,
        date: req._article.date
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
      if (!req._cap) return rep.forbidden()
      const { title, description, public: pub, date } = req.body
      await announcements.updateOne(
        { _id: req._articleId },
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
      if (!req._cap) return rep.forbidden()
      await announcements.deleteOne({ _id: req._articleId })
      return {}
    }
  )
})
