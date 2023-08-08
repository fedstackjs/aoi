import { Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import { IOrgMembership, OrgCapability, orgMemberships, orgs } from '../../db/index.js'
import { defineRoutes, paramSchemaMerger, loadUUID } from '../common/index.js'
import { orgAdminRoutes } from './admin/index.js'
import { SOrgProfile } from '../../schemas/index.js'
import { CAP_NONE, hasCapability } from '../../index.js'

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

export const orgScopedRoutes = defineRoutes(async (s) => {
  s.decorateRequest('orgId', null)
  s.decorateRequest('orgMembership', null)

  s.addHook('onRoute', paramSchemaMerger(orgIdSchema))

  s.addHook('onRequest', async (req) => {
    req._orgId = loadUUID(req.params, 'orgId', s.httpErrors.notFound())
    const member = await orgMemberships.findOne({
      userId: req.user.userId,
      orgId: req._orgId
    })
    req._orgMembership = member
  })

  s.register(orgAdminRoutes, { prefix: '/admin' })

  s.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Object({
            profile: SOrgProfile,
            capability: Type.String()
          })
        }
      }
    },
    async (req) => {
      const org = await orgs.findOne({ _id: req._orgId })
      if (!org) throw s.httpErrors.badRequest()
      if (
        org.ownerId.equals(req.user.userId) &&
        !hasCapability(req._orgMembership?.capability ?? CAP_NONE, OrgCapability.CAP_ADMIN)
      ) {
        await orgMemberships.updateOne(
          { userId: req.user.userId, orgId: req._orgId },
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
        capability: (req._orgMembership?.capability ?? CAP_NONE).toString()
      }
    }
  )
})
