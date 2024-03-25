import { BSON } from 'mongodb'

import { ORG_CAPS, SGroupProfile } from '../../index.js'
import { T } from '../../schemas/index.js'
import { ensureCapability, findPaginated } from '../../utils/index.js'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'

import { groupScopedRoutes } from './scoped.js'

export const groupRoutes = defineRoutes(async (s) => {
  const { groups } = s.db

  s.addHook('onRoute', swaggerTagMerger('group'))

  s.register(groupScopedRoutes, { prefix: '/:groupId' })

  s.get(
    '/',
    {
      schema: {
        description: 'List group in an organization',
        querystring: T.Object({
          orgId: T.String(),
          page: T.Integer({ minimum: 1, default: 1 }),
          perPage: T.Integer({ enum: [15, 30, 50, 100] }),
          count: T.Boolean({ default: false })
        }),
        response: {
          200: T.PaginationResult(
            T.Object({
              _id: T.UUID(),
              orgId: T.UUID(),
              profile: SGroupProfile
            })
          )
        }
      }
    },
    async (req) => {
      const orgId = loadUUID(req.query, 'orgId', s.httpErrors.badRequest())
      const { page, perPage, count } = req.query
      const result = await findPaginated(groups, page, perPage, count, { orgId })
      return result
    }
  )

  s.post(
    '/',
    {
      schema: {
        description: 'Create a group',
        body: T.Object({
          orgId: T.String(),
          profile: SGroupProfile
        }),
        response: {
          200: T.Object({
            groupId: T.UUID()
          })
        }
      }
    },
    async (req, rep) => {
      const orgId = loadUUID(req.body, 'orgId', s.httpErrors.badRequest())
      const membership = await req.loadMembership(orgId)
      if (!membership) return rep.forbidden()
      ensureCapability(membership.capability, ORG_CAPS.CAP_ADMIN, s.httpErrors.forbidden())
      const { insertedId } = await groups.insertOne({
        _id: new BSON.UUID(),
        orgId,
        profile: req.body.profile
      })
      return {
        groupId: insertedId
      }
    }
  )
})
