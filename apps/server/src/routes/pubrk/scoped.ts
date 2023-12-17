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
import { defineInjectionPoint } from '../../utils/inject.js'

const kPubrkContext = defineInjectionPoint<{
  _ranklistId: number
  _pubranklist: IPublicRanklist
}>('pubrk')

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
    const ranklistId = +(req.params as Record<string, string>).ranklistId
    if (!Number.isInteger(ranklistId)) return s.httpErrors.notFound()
    const ranklist = await pubrk.findOne({ ranklistId: ranklistId })
    if (!ranklist) throw s.httpErrors.notFound()
    req.provide(kPubrkContext, {
      _ranklistId: ranklistId,
      _pubranklist: ranklist
    })
  })

  s.register(async (s) => {
    // Only download url is public
    s.addHook('onRoute', (route) => {
      ;(route.schema ??= {}).security = []
    })
    s.register(getFileUrl, {
      resolve: async (type, query, req) => {
        const ctx = req.inject(kPubrkContext)
        if (!ctx._pubranklist.visible) throw s.httpErrors.notFound()
        const oss = await loadOrgOssSettings(ctx._pubranklist.orgId)
        const key = ctx._pubranklist.ranklistKey
        return [oss, contestRanklistKey(ctx._pubranklist.contestId, key), query]
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
    async (req) => {
      return { visible: req.inject(kPubrkContext)._pubranklist.visible }
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
      const ctx = req.inject(kPubrkContext)
      const contest = await contests.findOne({ _id: ctx._pubranklist.contestId })
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
        { ranklistId: ctx._ranklistId },
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
      const ctx = req.inject(kPubrkContext)
      const contest = await contests.findOne({ _id: ctx._pubranklist.contestId })
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
      const { deletedCount } = await pubrk.deleteOne({ ranklistId: ctx._ranklistId })
      return { ok: deletedCount === 1 }
    }
  )
})
