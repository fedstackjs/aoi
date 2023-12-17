import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../common/index.js'
import { BSON, Document } from 'mongodb'
import { findPaginated, users } from '../../index.js'

export const adminUserRoutes = defineRoutes(async (s) => {
  s.get(
    '/',
    {
      schema: {
        description: 'List org members',
        querystring: Type.Object({
          page: Type.Integer({ minimum: 0, default: 0 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false }),
          search: Type.Optional(Type.String({ minLength: 1 }))
        }),
        response: {
          200: Type.PaginationResult(Type.Any())
        }
      }
    },
    async (req) => {
      const filter: Document = {}
      if (req.query.search) {
        filter['profile.name'] = { $regex: req.query.search }
      }
      const { items, total } = await findPaginated(
        users,
        req.query.page,
        req.query.perPage,
        req.query.count,
        filter,
        {
          projection: {
            authSources: 0
          }
        }
      )
      return {
        items: items.map((item) => ({ ...item, capability: item.capability?.toString() })),
        total
      }
    }
  )

  s.patch(
    '/:userId/capability',
    {
      schema: {
        description: 'Update user capability',
        params: Type.Object({
          userId: Type.UUID()
        }),
        body: Type.Object({
          capability: Type.String()
        })
      }
    },
    async (req) => {
      const capability = new BSON.Long(req.body.capability)
      await users.updateOne({ _id: new BSON.UUID(req.params.userId) }, { $set: { capability } })
      return {}
    }
  )
})
