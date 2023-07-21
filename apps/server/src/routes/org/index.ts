import { TSchema, Type } from '@fastify/type-provider-typebox'
import { BSON } from 'mongodb'
import {
  IOrgMembership,
  OrgCapability,
  OrgProfileSchema,
  orgMemberships,
  orgs
} from '../../db/org.js'
import { defineRoutes } from '../common/index.js'
import { orgProblemRoutes } from './problem.js'
import { StrictObject, TypeUUID } from '../../utils/types.js'
import { hasCapability } from '../../utils/capability.js'

const orgIdSchema = Type.Object({
  orgId: Type.String()
})

declare module 'fastify' {
  interface FastifyRequest {
    _orgId: BSON.UUID
    /**
     * Guests have no membership
     */
    _orgMembership: IOrgMembership | null
  }
}

/**
 * Organization admin routes
 */
const orgAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    const capability = req._orgMembership?.capability
    if (!capability || !hasCapability(capability, OrgCapability.CAP_ADMIN)) {
      return rep.send(rep.forbidden())
    }
  })

  s.patch('/ownership', async () => {
    // TODO: change ownership
    throw s.httpErrors.notImplemented()
  })

  s.patch('/settings', async () => {
    // TODO: update settings
    throw s.httpErrors.notImplemented()
  })

  s.delete('/', async () => {
    // TODO: delete org
    throw s.httpErrors.notImplemented()
  })
})

/**
 * Organization scoped routes
 */
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
    const { orgId } = req.params as Record<string, string>
    if (!BSON.UUID.isValid(orgId)) {
      return rep.send(rep.notFound())
    }
    req._orgId = new BSON.UUID(orgId)
    const member = await orgMemberships.findOne({
      userId: req.user.userId,
      orgId: req._orgId
    })
    req._orgMembership = member
  })

  s.register(orgProblemRoutes, { prefix: '/problem' })
  s.register(orgAdminRoutes, { prefix: '/admin' })

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
      const org = await orgs.findOne({ _id: req._orgId })
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
