import { Document } from 'mongodb'

import { T } from '../../schemas/index.js'
import { findPaginated, escapeSearch } from '../../utils/index.js'
import { defineRoutes, md5, swaggerTagMerger } from '../common/index.js'

import { userScopedRoutes } from './scoped.js'

export const userRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('user'))

  s.get(
    '/',
    {
      schema: {
        description: 'List users',
        querystring: T.Object({
          page: T.Integer({ minimum: 1, default: 1 }),
          perPage: T.Integer({ enum: [15, 30, 50, 100] }),
          count: T.Boolean({ default: false }),
          search: T.Optional(T.String({ minLength: 1 }))
        }),
        response: {
          200: T.PaginationResult(
            T.Object({
              _id: T.UUID(),
              name: T.String(),
              emailHash: T.String(),
              namespace: T.Optional(T.String()),
              tags: T.Optional(T.Array(T.String()))
            })
          )
        }
      }
    },
    async (req) => {
      const filter: Document = {}
      if (req.query.search) {
        filter['profile.name'] = { $regex: escapeSearch(req.query.search) }
      }
      const { items, total } = await findPaginated(
        s.db.users,
        req.query.page,
        req.query.perPage,
        req.query.count,
        filter,
        {
          projection: {
            _id: 1,
            profile: {
              name: 1,
              email: 1
            },
            namespace: 1,
            tags: 1
          }
        }
      )
      return {
        items: items.map(({ _id, profile, namespace, tags }) => ({
          _id,
          name: profile.name,
          emailHash: md5(profile.email),
          namespace,
          tags
        })),
        total
      }
    }
  )

  s.register(userScopedRoutes, { prefix: '/:userId' })
})
