import { Type } from '@sinclair/typebox'
import { defineRoutes, loadMembership, loadUUID, swaggerTagMerger } from '../common/index.js'
import { groupScopedRoutes } from './scoped.js'
import { TypePaginationResult, ensureCapability, findPaginated } from '../../utils/index.js'
import { OrgCapability, SGroupProfile, TypeUUID, groups } from '../../index.js'
import { BSON } from 'mongodb'

export const groupRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('group'))

  s.register(groupScopedRoutes, { prefix: '/:groupId' })

  s.get(
    '/',
    {
      schema: {
        description: 'List group in an organization',
        querystring: Type.Object({
          orgId: Type.String(),
          page: Type.Integer({ minimum: 0, default: 0 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: TypePaginationResult(
            Type.Object({
              _id: TypeUUID(),
              orgId: TypeUUID(),
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
        body: Type.Object({
          orgId: Type.String(),
          profile: SGroupProfile
        }),
        response: {
          200: Type.Object({
            groupId: TypeUUID()
          })
        }
      }
    },
    async (req, rep) => {
      const orgId = loadUUID(req.body, 'orgId', s.httpErrors.badRequest())
      const membership = await loadMembership(req.user.userId, orgId)
      if (!membership) return rep.forbidden()
      ensureCapability(membership.capability, OrgCapability.CAP_ADMIN, s.httpErrors.forbidden())
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
