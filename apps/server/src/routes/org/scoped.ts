import { Type } from '@sinclair/typebox'
import { BSON } from 'mongodb'
import { OrgCapability, orgMemberships, orgs } from '../../db/index.js'
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
})
