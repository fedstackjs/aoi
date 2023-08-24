import { Type } from '@sinclair/typebox'
import { defineRoutes, loadMembership, swaggerTagMerger } from '../common/index.js'
import { BSON } from 'mongodb'
import { CAP_NONE, findPaginated, hasCapability } from '../../utils/index.js'
import { plans } from '../../db/plan.js'
import { OrgCapability } from '../../db/index.js'
import { AccessLevel } from '../../schemas/index.js'
import { planScopedRoutes } from './scoped.js'
import { searchToFilter } from '../../utils/search.js'

export const planRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('plan'))

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new plan',
        body: Type.Object({
          orgId: Type.String(),
          slug: Type.String(),
          title: Type.String(),
          accessLevel: Type.AccessLevel()
        }),
        response: {
          200: Type.Object({
            planId: Type.UUID()
          })
        }
      }
    },
    async (req, rep) => {
      const orgId = new BSON.UUID(req.body.orgId)
      const membership = await loadMembership(req.user.userId, orgId)
      if (!hasCapability(membership?.capability ?? CAP_NONE, OrgCapability.CAP_PLAN))
        return rep.forbidden()

      const { insertedId } = await plans.insertOne({
        _id: new BSON.UUID(),
        orgId,
        slug: req.body.slug,
        title: req.body.title,
        description: '',
        tags: [],
        contests: [],
        accessLevel: req.body.accessLevel,
        associations: [],
        settings: {},
        createdAt: req._now
      })
      return { planId: insertedId }
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'List plans',
        querystring: Type.Object({
          orgId: Type.String(),
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false }),
          search: Type.Optional(Type.String({ minLength: 1 })),
          tag: Type.Optional(Type.String())
        }),
        response: {
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
              slug: Type.String(),
              title: Type.String(),
              tags: Type.Array(Type.String())
            })
          )
        }
      }
    },
    async (req, rep) => {
      const { orgId: rawOrgId, page, perPage, count, ...rest } = req.query
      const orgId = new BSON.UUID(rawOrgId)
      const searchFilter = searchToFilter(rest)
      if (!searchFilter) return rep.badRequest('Bad search parameters')

      const membership = await loadMembership(req.user.userId, orgId)
      const basicAccessLevel = membership
        ? hasCapability(membership.capability, OrgCapability.CAP_CONTEST)
          ? AccessLevel.PRIVATE
          : AccessLevel.RESTRICED
        : AccessLevel.PUBLIC
      const principalIds = [req.user.userId, ...(membership?.groups ?? [])]
      const result = await findPaginated(
        plans,
        page,
        perPage,
        count,
        {
          orgId,
          ...searchFilter,
          $or: [
            { accessLevel: { $lte: basicAccessLevel } },
            { 'associations.principalId': { $in: principalIds } }
          ]
        },
        {
          projection: {
            _id: 1,
            slug: 1,
            title: 1,
            tags: 1
          }
        }
      )
      return result
    }
  )

  s.register(planScopedRoutes, { prefix: '/:planId' })
})
