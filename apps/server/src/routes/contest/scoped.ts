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
  contests
} from '../../db/index.js'
import { CAP_ALL, ensureCapability } from '../../utils/index.js'
import { TypeAccessLevel, TypeUUID } from '../../schemas/index.js'
import { attachmentRoutes } from './attachment.js'
import { adminRoutes } from './admin.js'
import { contestProblemRoutes } from './problem/index.js'

declare module 'fastify' {
  interface FastifyRequest {
    _contestId: BSON.UUID
    _contest: IContest
    _contestCapability: BSON.Long
    _contestStage: IContestStage
    _contestParticipant: IContestParticipant | null
    _now: number
  }
}

function getCurrentStage(now: number, { stages }: IContest) {
  for (let i = stages.length - 1; i >= 0; i--) {
    if (stages[i].start <= now) return stages[i]
  }
  return stages[0]
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
    req._now = Date.now()
    req._contestStage = getCurrentStage(req._now, contest)
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
            _id: TypeUUID(),
            accessLevel: TypeAccessLevel(),
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

  s.register(adminRoutes, { prefix: '/admin' })
  s.register(attachmentRoutes, { prefix: '/attachment' })
  s.register(contestProblemRoutes, { prefix: '/problem' })
})
