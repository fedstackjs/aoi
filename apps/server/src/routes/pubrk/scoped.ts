import { Type } from '@sinclair/typebox'
import { defineRoutes, paramSchemaMerger, loadCapability, loadMembership } from '../common/index.js'
import { contestRanklistKey } from '../../index.js'
import { getFileUrl, loadOrgOssSettings } from '../common/files.js'
import {
  OrgCapability,
  ContestCapability,
  IPublicRanklist,
  pubrk,
  contests
} from '../../db/index.js'
import { CAP_ALL, hasCapability } from '../../utils/index.js'
import { BSON } from 'mongodb'

declare module 'fastify' {
  interface FastifyRequest {
    _ranklistId: number
    _pubranklist: IPublicRanklist
    _contestId: BSON.UUID
  }
}

export const pubrkScopedRoutes = defineRoutes(async (s) => {
  s.addHook(
    'onRoute',
    paramSchemaMerger(
      Type.Object({
        ranklistId: Type.Number()
      })
    )
  )

  s.addHook('onRequest', async (req) => {
    const ranklistIdStr = (req.params as Record<string, string>).ranklistId
    try {
      req._ranklistId = parseInt(ranklistIdStr)
    } catch (e) {
      throw s.httpErrors.badRequest()
    }
    const ranklist = await pubrk.findOne({ ranklistId: req._ranklistId })
    if (!ranklist) throw s.httpErrors.notFound()
    req._pubranklist = ranklist
  })

  s.register(async (s) => {
    s.register(getFileUrl, {
      resolve: async (type, query, req) => {
        if (!req._pubranklist.visible) throw s.httpErrors.notFound()
        if (type !== 'download') throw s.httpErrors.badRequest()
        const oss = await loadOrgOssSettings(req._pubranklist.orgId)
        const key = req._pubranklist.ranklistKey
        return [oss, contestRanklistKey(req._pubranklist.contestId, key), query]
      },
      allowedTypes: ['download']
    })
  })

  s.get(
    '/visible',
    {
      schema: {
        response: {
          200: Type.Object({
            visible: Type.Boolean()
          })
        }
      }
    },
    async (req, rep) => {
      return { visible: req._pubranklist.visible }
    }
  )

  s.patch(
    '/visible',
    {
      schema: {
        body: Type.Object({
          visible: Type.Boolean()
        }),
        response: {
          200: Type.Object({
            ok: Type.Boolean()
          })
        }
      }
    },
    async (req, rep) => {
      const contest = await contests.findOne({ contestId: req._contestId })
      if (!contest) throw s.httpErrors.notFound()
      const membership = await loadMembership(req.user.userId, contest.orgId)
      const capability = loadCapability(
        contest,
        membership,
        OrgCapability.CAP_CONTEST,
        ContestCapability.CAP_ACCESS,
        CAP_ALL
      )
      if (!hasCapability(capability, ContestCapability.CAP_ADMIN)) {
        return rep.forbidden()
      }
      await pubrk.updateOne(
        { ranklistId: req._ranklistId },
        { $set: { visible: req.body.visible } }
      )
      return { ok: true }
    }
  )

  s.delete(
    '/',
    {
      schema: {
        response: {
          200: Type.Object({
            ok: Type.Boolean()
          })
        }
      }
    },
    async (req, rep) => {
      const contest = await contests.findOne({ contestId: req._contestId })
      if (!contest) throw s.httpErrors.notFound()
      const membership = await loadMembership(req.user.userId, contest.orgId)
      const capability = loadCapability(
        contest,
        membership,
        OrgCapability.CAP_CONTEST,
        ContestCapability.CAP_ACCESS,
        CAP_ALL
      )
      if (!hasCapability(capability, ContestCapability.CAP_ADMIN)) {
        return rep.forbidden()
      }
      const { deletedCount } = await pubrk.deleteOne({ ranklistId: req._ranklistId })
      return { ok: deletedCount === 1 }
    }
  )
})
