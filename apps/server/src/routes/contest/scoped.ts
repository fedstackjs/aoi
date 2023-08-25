import { Type } from '@sinclair/typebox'
import {
  defineRoutes,
  loadCapability,
  loadMembership,
  loadUUID,
  paramSchemaMerger
} from '../common/index.js'
import { BSON } from 'mongodb'
import { IContestStage, SContestStage } from '../../schemas/contest.js'
import {
  ContestCapability,
  IContest,
  IContestParticipant,
  OrgCapability,
  contestParticipants,
  contests,
  getCurrentContestStage,
  problems
} from '../../db/index.js'
import { CAP_ALL, ensureCapability, hasCapability } from '../../utils/index.js'
import { contestAttachmentRoutes } from './attachment.js'
import { contestAdminRoutes } from './admin.js'
import { contestProblemRoutes } from './problem/index.js'
import { contestSolutionRoutes } from './solution/index.js'
import { contestRanklistRoutes } from './ranklist/index.js'
import { manageContent } from '../common/content.js'

declare module 'fastify' {
  interface FastifyRequest {
    _contestId: BSON.UUID
    _contest: IContest
    _contestCapability: BSON.Long
    _contestStage: IContestStage
    _contestParticipant: IContestParticipant | null
  }
}

export const contestScopedRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        contestId: Type.String({ format: 'uuid' })
      })
    )
  )

  s.addHook('onRequest', async (req, rep) => {
    const contestId = loadUUID(req.params, 'contestId', s.httpErrors.badRequest())
    const contest = await contests.findOne({ _id: contestId })
    if (!contest) return rep.notFound()
    const membership = await loadMembership(req.user.userId, contest.orgId)
    const capability = loadCapability(
      contest,
      membership,
      OrgCapability.CAP_CONTEST,
      ContestCapability.CAP_ACCESS,
      CAP_ALL
    )
    ensureCapability(capability, ContestCapability.CAP_ACCESS, s.httpErrors.forbidden())
    req._contestId = contestId
    req._contest = contest
    req._contestStage = getCurrentContestStage(req._now, contest)
    req._contestCapability = capability
    req._contestParticipant = await contestParticipants.findOne({
      contestId: contestId,
      userId: req.user.userId
    })
  })

  s.get(
    '/',
    {
      schema: {
        description: 'Get contest details',
        response: {
          200: Type.Object({
            _id: Type.UUID(),
            orgId: Type.UUID(),
            accessLevel: Type.AccessLevel(),
            slug: Type.String(),
            title: Type.String(),
            description: Type.String(),
            tags: Type.Array(Type.String()),
            capability: Type.String(),
            stages: Type.Array(Type.Pick(SContestStage, ['name', 'start'] as const)),
            currentStage: SContestStage
          })
        }
      }
    },
    async (req) => {
      return {
        ...req._contest,
        capability: req._contestCapability.toString(),
        currentStage: req._contestStage
      }
    }
  )

  s.post(
    '/register',
    {
      schema: {
        description: 'Register for a contest',
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      const { registrationEnabled, registrationAllowPublic } = req._contestStage.settings
      if (
        !registrationEnabled &&
        !hasCapability(req._contestCapability, ContestCapability.CAP_ADMIN)
      ) {
        return rep.forbidden()
      }
      if (
        !registrationAllowPublic &&
        !hasCapability(req._contestCapability, ContestCapability.CAP_REGISTRATION)
      ) {
        return rep.forbidden()
      }

      await contestParticipants.insertOne({
        _id: new BSON.UUID(),
        userId: req.user.userId,
        contestId: req._contestId,
        results: {},
        updatedAt: Date.now()
      })
      return {}
    }
  )

  s.get(
    '/self',
    {
      schema: {
        description: 'Get participant details of self',
        response: {
          200: Type.Object({
            results: Type.Record(
              Type.String(),
              Type.Object({
                solutionCount: Type.Number()
              })
            )
          })
        }
      }
    },
    async (req, rep) => {
      if (!req._contestParticipant) return rep.preconditionFailed()
      return req._contestParticipant
    }
  )

  s.register(manageContent, {
    collection: contests,
    resolve: async (req) => {
      if (!hasCapability(req._contestCapability, ContestCapability.CAP_CONTENT)) return null
      return req._contestId
    },
    prefix: '/content'
  })

  s.register(contestAdminRoutes, { prefix: '/admin' })
  s.register(contestAttachmentRoutes, { prefix: '/attachment' })
  s.register(contestRanklistRoutes, { prefix: '/ranklist' })
  s.register(contestProblemRoutes, { prefix: '/problem' })
  s.register(contestSolutionRoutes, { prefix: '/solution' })
})
