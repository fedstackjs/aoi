import { TSchema, Type } from '@fastify/type-provider-typebox'
import { BSON } from 'mongodb'
import { IOrgMembership, OrgCapability, orgMemberships } from '../../db/org.js'
import { defineRoutes } from '../common/index.js'
import { orgProblemRoutes } from './problem.js'

const orgIdSchema = Type.Object({
  orgId: Type.String()
})

declare module 'fastify' {
  interface FastifyRequest {
    orgMembership: IOrgMembership
  }
}

export const orgRoutes = defineRoutes(async (s) => {
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
      const member = await orgMemberships.findOne({
        userId: req.user.userId,
        orgId: new BSON.UUID(orgId)
      })
      if (!member || member.capability.and(OrgCapability.CAP_ACCESS).isZero()) {
        throw s.httpErrors.forbidden()
      }
      req.orgMembership = member
    } catch (err) {
      rep.send(err)
    }
  })

  s.register(orgProblemRoutes, { prefix: '/problem' })
})
