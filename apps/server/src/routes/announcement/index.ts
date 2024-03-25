import { BSON, Document } from 'mongodb'

import { USER_CAPS } from '../../db/index.js'
import { T } from '../../schemas/index.js'
import { paginationSkip, hasCapability } from '../../utils/index.js'
import { loadUserCapability, defineRoutes, swaggerTagMerger } from '../common/index.js'

import { announcementScopedRoutes } from './scoped.js'

export const announcementRoutes = defineRoutes(async (s) => {
  const { announcements } = s.db

  s.addHook('onRoute', swaggerTagMerger('announcement'))

  s.register(announcementScopedRoutes, { prefix: '/:articleId' })

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new announcement',
        body: T.Object({
          title: T.String(),
          date: T.String(),
          public: T.Boolean()
        }),
        response: {
          200: T.Object({
            articleId: T.UUID()
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
        querystring: T.Object({
          page: T.Integer({ minimum: 1, default: 1 }),
          perPage: T.Integer({ enum: [15, 30, 50, 100] }),
          count: T.Boolean({ default: false })
        }),
        response: {
          200: T.PaginationResult(
            T.Object({
              _id: T.UUID(),
              title: T.String(),
              date: T.String(),
              public: T.Boolean()
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
