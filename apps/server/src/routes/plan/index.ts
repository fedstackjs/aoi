import { Type } from '@sinclair/typebox'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { UUID } from 'mongodb'
import { CAP_NONE, findPaginated, hasCapability } from '../../utils/index.js'
import { ORG_CAPS } from '../../db/index.js'
import { AccessLevel } from '../../schemas/index.js'
import { planScopedRoutes } from './scoped.js'
import { searchToFilter, filterMerge } from '../../utils/search.js'

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
      const orgId = new UUID(req.body.orgId)
      const membership = await req.loadMembership(orgId)
      if (!hasCapability(membership?.capability ?? CAP_NONE, ORG_CAPS.CAP_PLAN))
        return rep.forbidden()

      const { insertedId } = await s.db.plans.insertOne({
        _id: new UUID(),
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
    '/tags',
    {
      schema: {
        description: 'List plan tags',
        querystring: Type.Object({
          orgId: Type.UUID()
        }),
        response: {
          200: Type.Array(Type.String())
        }
      }
    },
    async (req) => {
      const tags = await s.db.plans.distinct('tags', { orgId: new UUID(req.query.orgId) })
      return tags
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'List plans',
        querystring: Type.Object({
          orgId: Type.UUID(),
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30, 50, 100] }),
          count: Type.Boolean({ default: false }),
          search: Type.Optional(Type.String({ minLength: 1 })),
          tag: Type.Optional(Type.String())
        }),
        response: {
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
              accessLevel: Type.AccessLevel(),
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
      const orgId = new UUID(rawOrgId)
      const searchFilter = searchToFilter(rest)
      if (!searchFilter) return rep.badRequest('Bad search parameters')

      const membership = await req.loadMembership(orgId)
      const basicAccessLevel = membership
        ? hasCapability(membership.capability, ORG_CAPS.CAP_CONTEST)
          ? AccessLevel.PRIVATE
          : AccessLevel.RESTRICED
        : AccessLevel.PUBLIC
      const principalIds = [req.user.userId, ...(membership?.groups ?? [])]
      const filter = filterMerge(
        {
          orgId,
          $or: [
            { accessLevel: { $lte: basicAccessLevel } },
            { 'associations.principalId': { $in: principalIds } }
          ]
        },
        searchFilter
      )
      const result = await findPaginated(s.db.plans, page, perPage, count, filter, {
        projection: {
          _id: 1,
          accessLevel: 1,
          slug: 1,
          title: 1,
          tags: 1
        }
      })
      return result
    }
  )

  s.get(
    '/demo',
    {
      schema: {
        description: 'List plans to be demonstrated on the homepage',
        querystring: Type.Object({
          orgId: Type.String()
        }),
        response: {
          200: Type.Array(
            Type.Object({
              _id: Type.UUID()
            })
          )
        }
      }
    },
    async (req) => {
      const { orgId: rawOrgId } = req.query
      const orgId = new UUID(rawOrgId)
      const searchFilter = { 'settings.promotion': true }
      const membership = await req.loadMembership(orgId)
      const basicAccessLevel = membership
        ? hasCapability(membership.capability, ORG_CAPS.CAP_CONTEST)
          ? AccessLevel.PRIVATE
          : AccessLevel.RESTRICED
        : AccessLevel.PUBLIC
      const principalIds = [req.user.userId, ...(membership?.groups ?? [])]
      const result = await s.db.plans
        .find(
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
              _id: 1
            }
          }
        )
        .toArray()
      return result
    }
  )

  s.register(planScopedRoutes, { prefix: '/:planId' })
})
