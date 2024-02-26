import { Type } from '@sinclair/typebox'
import { defineRoutes, loadUUID, swaggerTagMerger } from '../common/index.js'
import { CAP_NONE, ensureCapability, findPaginated, hasCapability } from '../../utils/index.js'
import { AccessLevel } from '../../schemas/index.js'
import { ContestRanklistState, ORG_CAPS, contests } from '../../db/index.js'
import { SContestStage } from '../../schemas/contest.js'
import { BSON } from 'mongodb'
import { contestScopedRoutes } from './scoped.js'
import { searchToFilter, filterMerge } from '../../utils/search.js'

export const contestRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('contest'))

  s.register(contestScopedRoutes, { prefix: '/:contestId' })

  s.post(
    '/',
    {
      schema: {
        description: 'Create a new contest',
        body: Type.Object({
          orgId: Type.String(),
          slug: Type.String(),
          title: Type.String(),
          accessLevel: Type.AccessLevel(),
          start: Type.Integer(),
          duration: Type.Integer()
        }),
        response: {
          200: Type.Object({
            contestId: Type.UUID()
          })
        }
      }
    },
    async (req) => {
      const orgId = loadUUID(req.body, 'orgId', s.httpErrors.badRequest())
      const membership = await req.loadMembership(orgId)
      ensureCapability(
        membership?.capability ?? CAP_NONE,
        ORG_CAPS.CAP_CONTEST,
        s.httpErrors.forbidden()
      )
      const { insertedId } = await contests.insertOne({
        _id: new BSON.UUID(),
        orgId,
        slug: req.body.slug,
        title: req.body.title,
        description: '',
        tags: [],
        problems: [],
        stages: [
          { name: 'upcoming', start: 0, settings: {} },
          { name: 'running', start: req.body.start, settings: {} },
          { name: 'end', start: req.body.start + req.body.duration, settings: {} }
        ],
        start: req.body.start,
        end: req.body.start + req.body.duration,
        attachments: [],
        associations: [],
        ranklists: [],
        ranklistState: ContestRanklistState.VALID,
        ranklistUpdatedAt: 0,
        accessLevel: req.body.accessLevel,
        participantCount: 0
      })
      return { contestId: insertedId }
    }
  )

  s.get(
    '/',
    {
      schema: {
        description: 'List contests',
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
              accessLevel: Type.AccessLevel(),
              slug: Type.String(),
              title: Type.String(),
              tags: Type.Array(Type.String()),
              start: Type.Integer(),
              end: Type.Integer(),
              stages: Type.Array(Type.Pick(SContestStage, ['name', 'start'] as const)),
              participantCount: Type.Integer()
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
      const result = await findPaginated(
        contests,
        page,
        perPage,
        count,
        filter,
        {
          projection: {
            _id: 1,
            accessLevel: 1,
            slug: 1,
            title: 1,
            tags: 1,
            start: 1,
            end: 1,
            stages: {
              name: 1,
              start: 1
            },
            participantCount: 1
          }
        },
        { start: -1 }
      )
      return result
    }
  )

  s.get(
    '/public',
    {
      schema: {
        description: 'List public contests',
        security: [],
        querystring: Type.Object({
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
              orgId: Type.UUID(),
              slug: Type.String(),
              title: Type.String(),
              tags: Type.Array(Type.String()),
              stages: Type.Array(Type.Pick(SContestStage, ['name', 'start'] as const)),
              participantCount: Type.Integer()
            })
          )
        }
      }
    },
    async (req, rep) => {
      const { page, perPage, count, ...rest } = req.query
      const searchFilter = searchToFilter(rest)
      if (!searchFilter) return rep.badRequest('Bad search parameters')

      const filter = filterMerge({ accessLevel: AccessLevel.PUBLIC }, searchFilter)
      const result = await findPaginated(
        contests,
        page,
        perPage,
        count,
        filter,
        {
          projection: {
            _id: 1,
            orgId: 1,
            slug: 1,
            title: 1,
            tags: 1,
            stages: {
              name: 1,
              start: 1
            },
            participantCount: 1
          }
        },
        { start: -1 }
      )
      return result
    }
  )
})
