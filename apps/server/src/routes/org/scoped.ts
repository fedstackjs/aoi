import { Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import { IOrgMembership, orgMemberships, OrgProfileSchema, orgs } from '../../db/org.js'
import { defineRoutes, paramSchemaMerger, loadUUID } from '../common/index.js'
import { orgAdminRoutes } from './admin.js'

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
    '/profile',
    {
      schema: {
        tags: ['organization'],
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
