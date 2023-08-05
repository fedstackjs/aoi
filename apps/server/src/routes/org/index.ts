import { Type } from '@fastify/type-provider-typebox'
import { BSON } from 'mongodb'
import { OrgProfileSchema, orgMemberships, orgs } from '../../db/org.js'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { StrictObject, TypeUUID } from '../../utils/types.js'
import { orgScopedRoutes } from './scoped.js'
import { CAP_ALL } from '../../utils/capability.js'

export const orgRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('organization'))

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new organization',
        body: StrictObject({
          profile: OrgProfileSchema
        }),
        response: {
          200: Type.Object({
            orgId: Type.String()
          })
        }
      }
    },
    async (req) => {
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
              _id: TypeUUID(),
              profile: OrgProfileSchema
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
