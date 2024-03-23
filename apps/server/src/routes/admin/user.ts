import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../common/index.js'
import { BSON, Document, UUID } from 'mongodb'
import { SUserProfile, findPaginated } from '../../index.js'

export const adminUserRoutes = defineRoutes(async (s) => {
  const { users } = s.db

  s.get(
    '/',
    {
      schema: {
        description: 'List all system user',
        querystring: Type.Object({
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30, 50, 100] }),
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

  s.post(
    '/',
    {
      schema: {
        description: 'Manually create a user',
        body: Type.StrictObject({
          profile: SUserProfile,
          capability: Type.Optional(Type.String()),
          namespace: Type.Optional(Type.String()),
          tags: Type.Optional(Type.Array(Type.String()))
        }),
        response: {
          200: Type.Object({
            userId: Type.String()
          })
        }
      }
    },
    async (req) => {
      const { insertedId } = await users.insertOne({
        ...req.body,
        _id: new UUID(),
        authSources: {},
        capability: req.body.capability ? new BSON.Long(req.body.capability) : undefined
      })
      return { userId: insertedId.toString() }
    }
  )

  s.post(
    '/login',
    {
      schema: {
        description: 'Login as given user, bypassing authentication',
        body: Type.Object({
          userId: Type.UUID(),
          tags: Type.Optional(Type.Array(Type.String()))
        })
      }
    },
    async (req, rep) => {
      const { userId, tags } = req.body
      const token = await rep.jwtSign({ userId: userId.toString(), tags }, { expiresIn: '7d' })
      return { token }
    }
  )
})
