import { Type } from '@sinclair/typebox'
import { ContestCapability, contests } from '../../../db/index.js'
import { hasCapability } from '../../../utils/index.js'
import { defineRoutes } from '../../common/index.js'
import { SContestRanklistSettings } from '../../../index.js'
import { kContestContext } from '../inject.js'

export const ranklistAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kContestContext)
    if (!hasCapability(ctx._contestCapability, ContestCapability.CAP_ADMIN)) {
      return rep.forbidden()
    }
  })

  s.post(
    '/',
    {
      schema: {
        body: Type.Object({
          key: Type.String(),
          name: Type.String()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)

      const { key, name } = req.body
      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId, [`ranklists.key`]: { $ne: key } },
        { $push: { ranklists: { key, name, settings: {} } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.get(
    '/:key/settings',
    {
      schema: {
        params: Type.Object({
          key: Type.String()
        }),
        response: {
          200: SContestRanklistSettings
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)

      const ranklist = ctx._contest.ranklists.find(({ key }) => key === req.params.key)
      if (!ranklist) return rep.notFound()
      return ranklist.settings
    }
  )

  s.patch(
    '/:key/settings',
    {
      schema: {
        params: Type.Object({
          key: Type.String()
        }),
        body: SContestRanklistSettings
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)

      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId, 'ranklists.key': req.params.key },
        { $set: { 'ranklists.$.settings': req.body } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )

  s.delete(
    '/:key',
    {
      schema: {
        params: Type.Object({
          key: Type.String()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kContestContext)

      const { modifiedCount } = await contests.updateOne(
        { _id: ctx._contestId },
        { $pull: { ranklists: { key: req.params.key } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})
