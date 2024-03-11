import { USER_CAPS, hasCapability } from '../../index.js'
import { loadUserCapability } from '../common/access.js'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { Type } from '@sinclair/typebox'
import { announcements } from '../../db/index.js'
import { paginationSkip } from '../../utils/pagination.js'
import { announcementScopedRoutes } from './scoped.js'
import { BSON, Document } from 'mongodb'

export const announcementRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('announcement'))

  s.register(announcementScopedRoutes, { prefix: '/:articleId' })

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new announcement',
        body: Type.Object({
          title: Type.String(),
          date: Type.String(),
          public: Type.Boolean()
        }),
        response: {
          200: Type.Object({
            articleId: Type.UUID()
          })
        }
      }
    },
    async (req, rep) => {
      const capability = await loadUserCapability(req)
      if (!hasCapability(capability, USER_CAPS.CAP_ADMIN)) return rep.forbidden()
      const { insertedId } = await announcements.insertOne({
        _id: new BSON.UUID(),
        title: req.body.title,
        description: '',
        public: req.body.public,
        date: req.body.date
      })
      return {
        articleId: insertedId
      }
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'Get all announcements',
        querystring: Type.Object({
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30, 50, 100] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
              title: Type.String(),
              date: Type.String(),
              public: Type.Boolean()
            })
          )
        },
        security: []
      }
    },
    async (req) => {
      const { page, perPage, count } = req.query
      const cap = await (async () => {
        if (!req.user) return false
        const capability = await loadUserCapability(req)
        return hasCapability(capability, USER_CAPS.CAP_ADMIN)
      })()
      const filter: Document = cap ? {} : { public: true }
      let total = 0
      if (count) {
        total = await announcements.countDocuments(filter)
      }
      const skip = paginationSkip(page, perPage)
      const items = await announcements
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .aggregate<any>([
          { $match: filter },
          { $sort: { date: -1 } },
          { $skip: skip },
          { $limit: perPage }
        ])
        .toArray()
      return { total, items }
    }
  )
})
