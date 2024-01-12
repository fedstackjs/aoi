import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'
import { CAP_NONE, ensureCapability } from '../../utils/index.js'
import { OrgCapability, pubrk } from '../../db/index.js'
import { pubrkScopedRoutes } from './scoped.js'

export const pubrkRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('pubrk'))

  s.register(pubrkScopedRoutes, { prefix: '/:ranklistId' })

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new public ranklist',
        body: Type.Object({
          contestId: Type.UUID(),
          orgId: Type.UUID(),
          ranklistKey: Type.String()
        }),
        response: {
          200: Type.Object({
            ranklistId: Type.Number()
          })
        }
      }
    },
    async (req) => {
      const orgId = loadUUID(req.body, 'orgId', s.httpErrors.badRequest())
      const contestId = loadUUID(req.body, 'contestId', s.httpErrors.badRequest())
      const membership = await req.loadMembership(orgId)
      ensureCapability(
        membership?.capability ?? CAP_NONE,
        OrgCapability.CAP_ADMIN,
        s.httpErrors.forbidden()
      )
      // find an unused ranklistId, because ranklistId is unique and we created descending index on it
      // so lets find the ranklistId of the first one and add 1
      const first = await pubrk.find({}).sort({ ranklistId: -1 }).limit(1).next()
      const ranklistId = first ? first.ranklistId + 1 : 1
      // now insert the ranklist
      await pubrk.insertOne({
        ranklistId,
        contestId,
        orgId,
        ranklistKey: req.body.ranklistKey,
        visible: false
      })
      return { ranklistId }
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'Check ranklistKey',
        querystring: Type.Object({
          contestId: Type.UUID(),
          ranklistKey: Type.String()
        }),
        response: {
          200: Type.Object({
            ranklistId: Type.Number(),
            status: Type.String()
          })
        }
      }
    },
    async (req) => {
      const contestId = loadUUID(req.query, 'contestId', s.httpErrors.badRequest())
      const ranklistKey = req.query.ranklistKey
      const ranklist = await pubrk.findOne({ contestId, ranklistKey })
      if (!ranklist) return { ranklistId: 0, status: 'not public' }
      return { ranklistId: ranklist.ranklistId, status: 'public' }
    }
  )
})
