import { BSON } from 'mongodb'

import { IGroup, IOrgMembership, IUser, ORG_CAPS } from '../../db/index.js'
import { CAP_NONE, hasCapability } from '../../index.js'
import { T, SOrgProfile } from '../../schemas/index.js'
import { defineRoutes, paramSchemaMerger, loadUUID, md5 } from '../common/index.js'

import { orgAdminRoutes } from './admin/index.js'
import { kOrgContext } from './inject.js'

const orgIdSchema = T.Object({
  orgId: T.String()
})

export const orgScopedRoutes = defineRoutes(async (s) => {
  const { orgs, orgMemberships, users, groups } = s.db

  s.addHook('onRoute', paramSchemaMerger(orgIdSchema))

  s.addHook('onRequest', async (req) => {
    const orgId = loadUUID(req.params, 'orgId', s.httpErrors.notFound())
    req.provide(kOrgContext, {
      _orgId: orgId,
      _orgMembership: await req.loadMembership(orgId)
    })
  })

  s.register(orgAdminRoutes, { prefix: '/admin' })

  s.get(
    '/',
    {
      schema: {
        description: 'Get organization details',
        response: {
          200: T.Object({
            profile: SOrgProfile,
            membership: T.Object({
              capability: T.String()
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
        req.user &&
        org.ownerId.equals(req.user.userId) &&
        !hasCapability(ctx._orgMembership?.capability ?? CAP_NONE, ORG_CAPS.CAP_ADMIN)
      ) {
        await orgMemberships.updateOne(
          { userId: req.user.userId, orgId: ctx._orgId },
          {
            $set: { capability: ORG_CAPS.CAP_ADMIN },
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
        body: T.Partial(
          T.Object({
            principalId: T.UUID(),
            name: T.String()
          })
        ),
        response: {
          200: T.Array(
            T.Object({
              principalId: T.UUID(),
              principalType: T.StringEnum(['guest', 'member', 'group']),
              name: T.String(),
              emailHash: T.String()
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
          Pick<IUser, '_id' | 'profile'> & {
            membership?: IOrgMembership
            principalType: 'member' | 'group'
          }
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
              principalType: {
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
        .aggregate<Pick<IGroup, '_id' | 'profile'> & { principalType: 'group' }>([
          { $match: { orgId, ...matchExpr } },
          {
            $project: {
              'profile.name': 1,
              'profile.email': 1
            }
          },
          { $addFields: { principalType: 'group' } }
        ])
        .toArray()

      const result = [...matchedUsers, ...matchedGroups].map(
        ({ _id, profile: { name, email }, principalType }) => ({
          principalId: _id,
          principalType,
          name,
          emailHash: md5(email)
        })
      )
      return result
    }
  )
})
