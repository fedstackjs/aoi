import { BSON } from 'mongodb'
import { defineRoutes, loadMembership, loadUUID, paramSchemaMerger } from '../common/index.js'
import { Type } from '@sinclair/typebox'
import {
  OrgCapability,
  SGroupProfile,
  ensureCapability,
  groups,
  orgMemberships,
  paginationSkip,
  problems
} from '../../index.js'

declare module 'fastify' {
  interface FastifyRequest {
    _groupId: BSON.UUID
  }
}

export const groupScopedRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        groupId: Type.String()
      })
    )
  )

  s.addHook('onRequest', async (req) => {
    req._groupId = loadUUID(req.params, 'groupId', s.httpErrors.notFound())
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get group details',
        response: {
          200: Type.Object({
            _id: Type.UUID(),
            orgId: Type.UUID(),
            profile: SGroupProfile
          })
        }
      }
    },
    async (req, rep) => {
      const group = await groups.findOne({ _id: req._groupId })
      if (!group) return rep.notFound()
      return group
    }
  )

  s.get(
    '/profile',
    {
      schema: {
        description: 'Get group profile',
        response: { 200: SGroupProfile }
      }
    },
    async (req, rep) => {
      const group = await groups.findOne({ _id: req._groupId }, { projection: { profile: 1 } })
      if (!group) return rep.notFound()
      return group.profile
    }
  )

  s.patch(
    '/profile',
    {
      schema: {
        description: 'Update group profile',
        body: SGroupProfile
      }
    },
    async (req, rep) => {
      const group = await groups.findOne({ _id: req._groupId }, { projection: { orgId: 1 } })
      if (!group) return rep.notFound()
      const membership = await loadMembership(req.user.userId, group.orgId)
      if (!membership) return rep.forbidden()
      ensureCapability(membership.capability, OrgCapability.CAP_ADMIN, s.httpErrors.forbidden())
      await groups.updateOne({ _id: req._groupId }, { $set: { profile: req.body } })
      return {}
    }
  )

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete group'
      }
    },
    async (req, rep) => {
      const group = await groups.findOne({ _id: req._groupId }, { projection: { orgId: 1 } })
      if (!group) return rep.notFound()
      const membership = await loadMembership(req.user.userId, group.orgId)
      if (!membership) return rep.forbidden()
      ensureCapability(membership.capability, OrgCapability.CAP_ADMIN, s.httpErrors.forbidden())
      // Remove Dependencies
      await orgMemberships.updateMany({ orgId: group.orgId }, { $pull: { groups: req._groupId } })
      await problems.updateMany(
        { 'associations.principalId': req._groupId },
        { $pull: { associations: { principalId: req._groupId } } }
      )
      await groups.deleteOne({ _id: req._groupId })
      return {}
    }
  )

  s.get(
    '/member',
    {
      schema: {
        description: 'List members in a group',
        querystring: Type.Object({
          page: Type.Integer({ minimum: 0, default: 0 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(Type.Any())
        }
      }
    },
    async (req, rep) => {
      const group = await groups.findOne({ _id: req._groupId }, { projection: { orgId: 1 } })
      if (!group) return rep.notFound()

      let count = 0
      if (req.query.count) {
        count = await orgMemberships.countDocuments({ orgId: group.orgId, groups: req._groupId })
      }
      const skip = paginationSkip(req.query.page, req.query.perPage)
      const members = await orgMemberships
        .aggregate([
          { $match: { orgId: group.orgId, groups: req._groupId } },
          { $skip: skip },
          { $limit: req.query.perPage },
          { $project: { _id: 1, userId: 1, capability: 1 } },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              'user._id': 1,
              'user.profile': 1,
              capability: 1
            }
          },
          {
            $addFields: {
              capability: {
                $toString: '$capability'
              }
            }
          }
        ])
        .toArray()
      return {
        total: count,
        items: members
      }
    }
  )

  s.post(
    '/member',
    {
      schema: {
        description: 'Add member to group',
        body: Type.Object({
          userId: Type.String()
        })
      }
    },
    async (req, rep) => {
      const group = await groups.findOne({ _id: req._groupId }, { projection: { orgId: 1 } })
      if (!group) return rep.notFound()
      const membership = await loadMembership(req.user.userId, group.orgId)
      if (!membership) return rep.forbidden()
      ensureCapability(membership.capability, OrgCapability.CAP_ADMIN, s.httpErrors.forbidden())
      const userId = loadUUID(req.body, 'userId', s.httpErrors.badRequest())
      const { modifiedCount } = await orgMemberships.updateOne(
        { userId, orgId: group.orgId },
        { $addToSet: { groups: req._groupId } }
      )
      if (!modifiedCount) return rep.badRequest()
      return {}
    }
  )

  s.delete(
    '/member/:userId',
    {
      schema: {
        description: 'Remove member from group',
        params: Type.Object({
          userId: Type.UUID()
        })
      }
    },
    async (req, rep) => {
      const group = await groups.findOne({ _id: req._groupId }, { projection: { orgId: 1 } })
      if (!group) return rep.notFound()
      const membership = await loadMembership(req.user.userId, group.orgId)
      if (!membership) return rep.forbidden()
      ensureCapability(membership.capability, OrgCapability.CAP_ADMIN, s.httpErrors.forbidden())
      const userId = loadUUID(req.params, 'userId', s.httpErrors.badRequest())
      const { modifiedCount } = await orgMemberships.updateOne(
        { userId, orgId: group.orgId },
        { $pull: { groups: req._groupId } }
      )
      if (!modifiedCount) return rep.badRequest()
      return {}
    }
  )
})
