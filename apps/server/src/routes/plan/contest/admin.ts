import { BSON } from 'mongodb'

import { PLAN_CAPS } from '../../../db/index.js'
import { SPlanContestSettings, T } from '../../../schemas/index.js'
import { hasCapability } from '../../../utils/index.js'
import { defineRoutes } from '../../common/index.js'
import { kPlanContext } from '../inject.js'

export const contestAdminRoutes = defineRoutes(async (s) => {
  const { plans, contests } = s.db

  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kPlanContext)
    if (!hasCapability(ctx._planCapability, PLAN_CAPS.CAP_ADMIN)) {
      return rep.forbidden()
    }
  })

  s.post(
    '/',
    {
      schema: {
        body: T.Object({
          contestId: T.String(),
          settings: SPlanContestSettings
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kPlanContext)

      const contestId = new BSON.UUID(req.body.contestId)
      const exists = await contests.countDocuments({
        _id: contestId,
        orgId: ctx._plan.orgId
      })
      if (!exists) return rep.notFound()
      const { modifiedCount } = await plans.updateOne(
        { _id: ctx._plan._id, 'contests.contestId': { $ne: contestId } },
        { $push: { contests: { contestId, settings: req.body.settings } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.get(
    '/:contestId/settings',
    {
      schema: {
        params: T.Object({
          contestId: T.String()
        }),
        response: { 200: SPlanContestSettings }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kPlanContext)

      const contest = ctx._plan.contests.find(({ contestId }) =>
        contestId.equals(req.params.contestId)
      )
      if (!contest) return rep.notFound()
      return contest.settings
    }
  )

  s.patch(
    '/:contestId/settings',
    {
      schema: {
        params: T.Object({
          contestId: T.String()
        }),
        body: SPlanContestSettings
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kPlanContext)

      const contestId = new BSON.UUID(req.params.contestId)
      const { modifiedCount } = await plans.updateOne(
        { _id: ctx._plan._id, 'contests.contestId': contestId },
        { $set: { 'contests.$.settings': req.body } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )

  s.delete(
    '/:contestId',
    {
      schema: {
        params: T.Object({
          contestId: T.String()
        })
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kPlanContext)

      const contestId = new BSON.UUID(req.params.contestId)
      const { modifiedCount } = await plans.updateOne(
        { _id: ctx._plan._id },
        { $pull: { contests: { contestId } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})
