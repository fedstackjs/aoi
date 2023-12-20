import { createHash } from 'node:crypto'
import { Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import {
  IGroup,
  IOrgMembership,
  IUser,
  OrgCapability,
  groups,
  orgMemberships,
  orgs,
  users
} from '../../db/index.js'
import { defineRoutes, paramSchemaMerger, loadUUID } from '../common/index.js'
import { orgAdminRoutes } from './admin/index.js'
import { SOrgProfile } from '../../schemas/index.js'
import { CAP_NONE, hasCapability } from '../../index.js'
import { kOrgContext } from './inject.js'

const orgIdSchema = Type.Object({
  orgId: Type.String()
})

export const orgScopedRoutes = defineRoutes(async (s) => {
  s.decorateRequest('orgId', null)
  s.decorateRequest('orgMembership', null)

  s.addHook('onRoute', paramSchemaMerger(orgIdSchema))

  s.addHook('onRequest', async (req) => {
    const orgId = loadUUID(req.params, 'orgId', s.httpErrors.notFound())
    req.provide(kOrgContext, {
      _orgId: orgId,
      _orgMembership: await orgMemberships.findOne({
        userId: req.user.userId,
        orgId: orgId
      })
    })
  })

  s.register(orgAdminRoutes, { prefix: '/admin' })

  s.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Object({
            profile: SOrgProfile,
            membership: Type.Object({
              capability: Type.String()
            })
          })
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kOrgContext)
      const org = await orgs.findOne({ _id: ctx._orgId })
      if (!org) throw s.httpErrors.badRequest()
      if (
        org.ownerId.equals(req.user.userId) &&
        !hasCapability(ctx._orgMembership?.capability ?? CAP_NONE, OrgCapability.CAP_ADMIN)
      ) {
        await orgMemberships.updateOne(
          { userId: req.user.userId, orgId: ctx._orgId },
          {
            $set: { capability: OrgCapability.CAP_ADMIN },
            $setOnInsert: {
              _id: new BSON.UUID(),
              groups: []
            }
          },
          { upsert: true }
        )
      }
      return {
        profile: org.profile,
        membership: {
          capability: (ctx._orgMembership?.capability ?? CAP_NONE).toString()
        }
      }
    }
  )

  s.post(
    '/search-principals',
    {
      schema: {
        description: 'Search for principals in the organization',
        body: Type.Partial(
          Type.Object({
            principalId: Type.UUID(),
            name: Type.String()
          })
        ),
        response: {
          200: Type.Array(
            Type.Object({
              principalId: Type.UUID(),
              name: Type.String(),
              emailHash: Type.String(),
              type: Type.StringEnum(['guest', 'member', 'group'])
            }),
            { maxItems: 50 }
          )
        }
      }
    },
    async (req) => {
      if (Object.keys(req.body).length !== 1) {
        throw s.httpErrors.badRequest(`Required exactly one of 'principalId' or 'name'`)
      }
      const matchExpr = req.body.principalId
        ? { _id: new BSON.UUID(req.body.principalId) }
        : { 'profile.name': req.body.name }

      const orgId = req.inject(kOrgContext)._orgId

      const matchedUsers = await users
        .aggregate<
          Pick<IUser, '_id' | 'profile'> & { membership?: IOrgMembership; type: 'member' | 'group' }
        >([
          { $match: { ...matchExpr } },
          {
            $project: {
              'profile.name': 1,
              'profile.email': 1
            }
          },
          {
            $lookup: {
              from: 'orgMemberships',
              let: { userId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ['$userId', '$$userId'] }, { $eq: ['$orgId', orgId] }]
                    }
                  }
                }
              ],
              as: 'membership'
            }
          },
          { $unwind: { path: '$membership', preserveNullAndEmptyArrays: true } },
          {
            $addFields: {
              type: {
                $cond: {
                  if: { $eq: ['$membership', null] },
                  then: 'guest',
                  else: 'member'
                }
              }
            }
          }
        ])
        .toArray()

      const matchedGroups = await groups
        .aggregate<Pick<IGroup, '_id' | 'profile'> & { type: 'group' }>([
          { $match: { orgId, ...matchExpr } },
          {
            $project: {
              'profile.name': 1,
              'profile.email': 1
            }
          },
          { $addFields: { type: 'group' } }
        ])
        .toArray()

      const result = [...matchedUsers, ...matchedGroups].map(
        ({ _id, profile: { name, email }, type }) => ({
          principalId: _id,
          name,
          emailHash: createHash('md5').update(email).digest('hex'),
          type
        })
      )
      return result
    }
  )
})
