import { defineRoutes, paramSchemaMerger } from '../../common/index.js'
import {
  ContestCapability,
  IContestRanklistSettings,
  contestRanklistKey,
  hasCapability
} from '../../../index.js'
import { Type } from '@sinclair/typebox'
import { getFileUrl, loadOrgOssSettings } from '../../common/files.js'
import { ranklistAdminRoutes } from './admin.js'

function shouldShow(now: number, settings: IContestRanklistSettings) {
  return (settings.showAfter ?? 0) <= now && now <= (settings.showBefore ?? Infinity)
}

const ranklistViewRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (hasCapability(req._contestCapability, ContestCapability.CAP_ADMIN)) return
    if (req._contestStage.settings.ranklistEnabled && req._contestParticipant) return
    return rep.forbidden()
  })

  s.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Array(
            Type.Object({
              key: Type.String(),
              name: Type.String()
            })
          )
        }
      }
    },
    async (req) => {
      let ranklists = req._contest.ranklists
      if (!hasCapability(req._contestCapability, ContestCapability.CAP_ADMIN)) {
        const now = Date.now()
        ranklists = ranklists.filter((r) => shouldShow(now, r.settings))
      }
      return ranklists
    }
  )

  s.register(
    async (s) => {
      s.addHook('onRoute', paramSchemaMerger(Type.Object({ key: Type.String() })))
      s.register(getFileUrl, {
        prefix: '/url',
        resolve: async (type, query, req) => {
          const ranklist = req._contest.ranklists.find(
            (r) => r.key === (req.params as { key: string }).key
          )
          if (!ranklist) throw s.httpErrors.notFound()
          const isAdmin = hasCapability(req._contestCapability, ContestCapability.CAP_ADMIN)
          if (!isAdmin && !shouldShow(Date.now(), ranklist.settings)) throw s.httpErrors.notFound()
          if (!isAdmin && type !== 'download') throw s.httpErrors.forbidden()

          const oss = await loadOrgOssSettings(req._contest.orgId)
          const key = (req.params as { key: string }).key
          return [oss, contestRanklistKey(req._contestId, key), query]
        },
        allowedTypes: ['download']
      })
    },
    { prefix: '/:key' }
  )
})

export const contestRanklistRoutes = defineRoutes(async (s) => {
  s.register(ranklistAdminRoutes)
  s.register(ranklistViewRoutes)
})
