import { TSchema, Type } from '@fastify/type-provider-typebox'
import { BSON } from 'mongodb'
import { IOrgMembership, OrgProfileSchema, orgMemberships, orgs } from '../../db/org.js'
import { defineRoutes } from '../common/index.js'
import { orgProblemRoutes } from './problem.js'
import { StrictObject, TypeUUID } from '../../utils/types.js'

const orgIdSchema = Type.Object({
  orgId: Type.String()
})

declare module 'fastify' {
  interface FastifyRequest {
    orgId: BSON.UUID
    orgMembership: IOrgMembership | null
  }
}

const orgScopedRoutes = defineRoutes(async (s) => {
  s.decorateRequest('orgId', null)
  s.decorateRequest('orgMembership', null)

  s.addHook('onRoute', (route) => {
    const oldParams = route.schema?.params
    if (oldParams) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      route.schema!.params = Type.Intersect([oldParams as TSchema, orgIdSchema])
    } else {
      ;(route.schema ??= {}).params = orgIdSchema
    }
  })

  s.addHook('onRequest', async (req, rep) => {
    try {
      await req.jwtVerify()
      const { orgId } = req.params as Record<string, string>
      if (!orgId) throw s.httpErrors.badRequest()
      req.orgId = new BSON.UUID(orgId)
      const member = await orgMemberships.findOne({
        userId: req.user.userId,
        orgId: req.orgId
      })
      req.orgMembership = member
    } catch (err) {
      rep.send(err)
    }
  })

  s.register(orgProblemRoutes, { prefix: '/problem' })

  s.get(
    '/profile',
    {
      schema: {
        response: {
          200: OrgProfileSchema
        }
      }
    },
    async (req) => {
      const org = await orgs.findOne({ _id: req.orgId })
      if (!org) throw s.httpErrors.badRequest()
      return org.profile
    }
  )
})

export const orgRoutes = defineRoutes(async (s) => {
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
