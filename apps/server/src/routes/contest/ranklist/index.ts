import {
  CONTEST_CAPS,
  IContestRanklistSettings,
  contestRanklistKey,
  hasCapability
} from '../../../index.js'
import { T } from '../../../schemas/index.js'
import { getFileUrl } from '../../common/files.js'
import { defineRoutes, paramSchemaMerger } from '../../common/index.js'
import { kContestContext } from '../inject.js'

import { ranklistAdminRoutes } from './admin.js'

function shouldShow(now: number, settings: IContestRanklistSettings) {
  return (settings.showAfter ?? 0) <= now && now <= (settings.showBefore ?? Infinity)
}

const ranklistViewRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kContestContext)

    if (hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)) return
    if (ctx._contestStage.settings.ranklistEnabled && ctx._contestParticipant) return
    return rep.forbidden()
  })

  s.get(
    '/',
    {
      schema: {
        response: {
          200: T.Array(
            T.Object({
              key: T.String(),
              name: T.String()
            })
          )
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kContestContext)

      let ranklists = ctx._contest.ranklists
      if (!hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)) {
        const now = Date.now()
        ranklists = ranklists.filter((r) => shouldShow(now, r.settings))
      }
      return ranklists
    }
  )

  s.register(
    async (s) => {
      s.addHook('onRoute', paramSchemaMerger(T.Object({ key: T.String() })))
      s.register(getFileUrl, {
        prefix: '/url',
        resolve: async (type, query, req) => {
          const ctx = req.inject(kContestContext)

          const ranklist = ctx._contest.ranklists.find(
            (r) => r.key === (req.params as { key: string }).key
          )
          if (!ranklist) throw s.httpErrors.notFound()
          const isAdmin = hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)
          if (!isAdmin && !shouldShow(Date.now(), ranklist.settings)) throw s.httpErrors.notFound()
          if (!isAdmin && type !== 'download') throw s.httpErrors.forbidden()

          const key = (req.params as { key: string }).key
          return [ctx._contest.orgId, contestRanklistKey(ctx._contestId, key), query]
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
