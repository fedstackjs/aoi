import { Type } from '@fastify/type-provider-typebox'
import { BSON } from 'mongodb'
import { OrgProfileSchema, orgMemberships, orgs } from '../../db/org.js'
import { defineRoutes } from '../common/index.js'
import { StrictObject, TypeUUID } from '../../utils/types.js'
import { orgScopedRoutes } from './scoped.js'

export const orgRoutes = defineRoutes(async (s) => {
  s.post(
    '/',
    {
      schema: {
        description: 'Create a new organization',
        tags: ['organization'],
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
        capability: BSON.Long.MAX_UNSIGNED_VALUE,
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
        tags: ['organization'],
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
        .find({ _id: { $in: orgIds } }, { projection: { profile: 1 } })
        .toArray()
      return orgList
    }
  )

  s.register(orgScopedRoutes, { prefix: '/:orgId' })
})
