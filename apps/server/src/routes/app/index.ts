import { randomBytes } from 'node:crypto'
import { Type } from '@sinclair/typebox'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { UUID } from 'mongodb'
import { CAP_NONE, findPaginated, hasCapability } from '../../utils/index.js'
import { ORG_CAPS } from '../../db/index.js'
import { filterMerge, searchToFilter } from '../../utils/search.js'
import { AccessLevel } from '../../schemas/index.js'
import { appScopedRoutes } from './scoped.js'

export const appRoutes = defineRoutes(async (s) => {
  const { apps } = s.db

  s.addHook('onRoute', swaggerTagMerger('app'))

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new app',
        body: Type.Object({
          orgId: Type.String(),
          slug: Type.String(),
          title: Type.String(),
          accessLevel: Type.AccessLevel()
        }),
        response: {
          200: Type.Object({
            appId: Type.UUID()
          })
        }
      }
    },
    async (req, rep) => {
      const orgId = new UUID(req.body.orgId)
      const membership = await req.loadMembership(orgId)
      if (!hasCapability(membership?.capability ?? CAP_NONE, ORG_CAPS.CAP_APP))
        return rep.forbidden()

      const secret = randomBytes(32).toString('base64url')

      const { insertedId } = await apps.insertOne({
        _id: new UUID(),
        orgId,
        slug: req.body.slug,
        title: req.body.title,
        description: '',
        tags: [],
        accessLevel: req.body.accessLevel,
        associations: [],
        settings: {},
        secret,
        createdAt: req._now
      })
      return { appId: insertedId, secret }
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'List apps',
        querystring: Type.Object({
          orgId: Type.String(),
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
      const result = await findPaginated(apps, page, perPage, count, filter, {
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

  s.register(appScopedRoutes, { prefix: '/:appId' })
})
