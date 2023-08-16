import { Type } from '@sinclair/typebox'
import { OrgCapability, orgMemberships, users } from '../../../db/index.js'
import { paginationSkip } from '../../../utils/index.js'
import { defineRoutes, loadUUID } from '../../common/index.js'
import { BSON } from 'mongodb'

export const orgAdminMemberRoutes = defineRoutes(async (s) => {
  s.get(
    '/',
    {
      schema: {
        description: 'List org members',
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
    async (req) => {
      let count = 0
      if (req.query.count) {
        count = await orgMemberships.countDocuments({ orgId: req._orgId })
      }
      const skip = paginationSkip(req.query.page, req.query.perPage)
      const members = await orgMemberships
        .aggregate([
          { $match: { orgId: req._orgId } },
          { $skip: skip },
          { $limit: req.query.perPage },
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
              capability: 1,
              groups: 1
            }
          },
          {
            $lookup: {
              from: 'groups',
              localField: 'groups',
              foreignField: '_id',
              as: 'groups'
            }
          },
          {
            $project: {
              _id: 1,
              'user._id': 1,
              'user.profile': 1,
              capability: 1,
              'groups._id': 1,
              'groups.profile': 1
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
    '/',
    {
      schema: {
        description: 'Add member to org',
        body: Type.Object({
          userId: Type.String()
        }),
        response: {
          200: Type.Object({
            membershipId: Type.UUID()
          })
        }
      }
    },
    async (req, rep) => {
      const userId = loadUUID(req.body, 'userId', s.httpErrors.badRequest())
      const exists = await users.countDocuments({ _id: userId })
      if (!exists) return rep.badRequest()
      const { insertedId } = await orgMemberships.insertOne({
        _id: new BSON.UUID(),
        userId,
        orgId: req._orgId,
        capability: OrgCapability.CAP_ACCESS,
        groups: []
      })
      return { membershipId: insertedId }
    }
  )

  s.patch(
    '/:userId/capability',
    {
      schema: {
        description: 'Update member capability',
        params: Type.Object({
          userId: Type.String()
        }),
        body: Type.Object({
          capability: Type.String()
        })
      }
    },
    async (req, rep) => {
      const userId = loadUUID(req.params, 'userId', s.httpErrors.badRequest())
      const capability = new BSON.Long(req.body.capability)
      const { modifiedCount } = await orgMemberships.updateOne(
        { userId, orgId: req._orgId },
        { $set: { capability } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )

  s.delete(
    '/:userId',
    {
      schema: {
        description: 'Remove member from org',
        params: Type.Object({
          userId: Type.String()
        })
      }
    },
    async (req, rep) => {
      const userId = loadUUID(req.params, 'userId', s.httpErrors.badRequest())
      if (userId.equals(req.user.userId)) return rep.badRequest()
      // TODO: Should we check for associated resources?
      const { deletedCount } = await orgMemberships.deleteOne({
        userId,
        orgId: req._orgId
      })
      if (!deletedCount) return rep.notFound()
      return {}
    }
  )
})
