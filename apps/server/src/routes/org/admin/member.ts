import { Type } from '@sinclair/typebox'
import bcrypt from 'bcrypt'
import { IUser, ORG_CAPS } from '../../../db/index.js'
import { paginationSkip } from '../../../utils/index.js'
import { defineRoutes, loadUUID } from '../../common/index.js'
import { BSON } from 'mongodb'
import { SUserProfile } from '../../../index.js'
import { kOrgContext } from '../inject.js'

export const orgAdminMemberRoutes = defineRoutes(async (s) => {
  const { users, orgMemberships } = s.db

  s.get(
    '/',
    {
      schema: {
        description: 'List org members',
        querystring: Type.Object({
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30, 50, 100] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(Type.Any())
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kOrgContext)
      let count = 0
      if (req.query.count) {
        count = await orgMemberships.countDocuments({ orgId: ctx._orgId })
      }
      const skip = paginationSkip(req.query.page, req.query.perPage)
      const members = await orgMemberships
        .aggregate([
          { $match: { orgId: ctx._orgId } },
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
      const ctx = req.inject(kOrgContext)
      const userId = loadUUID(req.body, 'userId', s.httpErrors.badRequest())
      const exists = await users.countDocuments({ _id: userId })
      if (!exists) return rep.badRequest()
      const { insertedId } = await orgMemberships.insertOne({
        _id: new BSON.UUID(),
        userId,
        orgId: ctx._orgId,
        capability: ORG_CAPS.CAP_ACCESS,
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
      const ctx = req.inject(kOrgContext)
      const userId = loadUUID(req.params, 'userId', s.httpErrors.badRequest())
      const capability = new BSON.Long(req.body.capability)
      const { modifiedCount } = await orgMemberships.updateOne(
        { userId, orgId: ctx._orgId },
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
      const ctx = req.inject(kOrgContext)
      const userId = loadUUID(req.params, 'userId', s.httpErrors.badRequest())
      if (userId.equals(req.user.userId)) return rep.badRequest()
      // TODO: Should we check for associated resources?
      const { deletedCount } = await orgMemberships.deleteOne({
        userId,
        orgId: ctx._orgId
      })
      if (!deletedCount) return rep.notFound()
      return {}
    }
  )

  s.post(
    '/batchImport',
    {
      schema: {
        description: 'Batch import members',
        body: Type.Object({
          users: Type.Array(
            Type.Object({
              profile: SUserProfile,
              password: Type.String(),
              passwordResetDue: Type.Boolean({ default: false }),
              orgCapability: Type.String({ default: ORG_CAPS.CAP_ACCESS.toString() }),
              orgGroups: Type.Array(Type.UUID(), { default: [] })
            })
          ),
          ignoreDuplicates: Type.Boolean({ default: false })
        })
      }
    },
    async (req) => {
      const ctx = req.inject(kOrgContext)
      const usersToInsert = await Promise.all(
        req.body.users.map(
          async (user) =>
            ({
              _id: new BSON.UUID(),
              profile: user.profile,
              authSources: {
                password: await bcrypt.hash(user.password, 10),
                passwordResetDue: user.passwordResetDue
              }
            }) satisfies IUser
        )
      )
      const { insertedCount, insertedIds } = await users.insertMany(usersToInsert, {
        ordered: !req.body.ignoreDuplicates
      })
      let successCount = 0
      for (let i = 0; i < req.body.users.length; i++) {
        try {
          const id =
            insertedIds[i] ??
            (await users.findOne({ 'profile.name': req.body.users[i].profile.name }))?._id
          if (!id) continue
          const { insertedId } = await orgMemberships.insertOne({
            _id: new BSON.UUID(),
            userId: id,
            orgId: ctx._orgId,
            capability: new BSON.Long(req.body.users[i].orgCapability),
            groups: req.body.users[i].orgGroups.map((g) => new BSON.UUID(g))
          })
          if (insertedId) successCount++
        } catch (err) {
          console.log(err)
        }
      }
      return { insertedCount, successCount }
    }
  )
})
