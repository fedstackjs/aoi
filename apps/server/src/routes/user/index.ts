import { Type } from '@sinclair/typebox'
import { Document } from 'mongodb'
import { defineRoutes, md5, swaggerTagMerger } from '../common/index.js'
import { userScopedRoutes } from './scoped.js'
import { findPaginated } from '../../utils/index.js'
import { escapeSearch } from '../../utils/search.js'

export const userRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('user'))

  s.get(
    '/',
    {
      schema: {
        description: 'List users',
        querystring: Type.Object({
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30, 50, 100] }),
          count: Type.Boolean({ default: false }),
          search: Type.Optional(Type.String({ minLength: 1 }))
        }),
        response: {
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
              name: Type.String(),
              emailHash: Type.String(),
              namespace: Type.Optional(Type.String()),
              tags: Type.Optional(Type.Array(Type.String()))
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
