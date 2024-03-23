import { Type } from '@fastify/type-provider-typebox'
import { BSON } from 'mongodb'
import { USER_CAPS } from '../../db/index.js'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { orgScopedRoutes } from './scoped.js'
import { CAP_ALL, CAP_NONE, hasCapability } from '../../utils/capability.js'
import { SOrgProfile } from '../../schemas/index.js'

export const orgRoutes = defineRoutes(async (s) => {
  const { orgs, orgMemberships, users } = s.db

  s.addHook('onRoute', swaggerTagMerger('organization'))

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new organization',
        body: Type.Object({
          profile: SOrgProfile
        }),
        response: {
          200: Type.Object({
            orgId: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const user = await users.findOne({ _id: req.user.userId }, { projection: { capability: 1 } })
      if (!user || !hasCapability(user.capability ?? CAP_NONE, USER_CAPS.CAP_CREATE_ORG))
        return rep.forbidden()

      const { insertedId } = await orgs.insertOne({
        _id: new BSON.UUID(),
        ownerId: req.user.userId,
        profile: req.body.profile,
        settings: {}
      })
      await orgMemberships.insertOne({
        _id: new BSON.UUID(),
        userId: req.user.userId,
        orgId: insertedId,
        // Owner have all capabilities
        capability: CAP_ALL,
        groups: []
      })
      return { orgId: insertedId.toString() }
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'List joined organizations',
        response: {
          200: Type.Array(
            Type.Object({
              _id: Type.UUID(),
              profile: SOrgProfile
            })
          )
        }
      }
    },
    async (req) => {
      const memberships = await orgMemberships.find({ userId: req.user.userId }).toArray()
      const orgIds = memberships.map((m) => m.orgId)
      const orgList = await orgs
        .find(
          { $or: [{ _id: { $in: orgIds } }, { ownerId: req.user.userId }] },
          { projection: { profile: 1 } }
        )
        .toArray()
      return orgList
    }
  )

  s.register(orgScopedRoutes, { prefix: '/:orgId' })
})
