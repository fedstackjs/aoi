import { Type } from '@sinclair/typebox'
import {
  PlanCapacity,
  SPlanContestSettings,
  contests,
  hasCapability,
  plans
} from '../../../index.js'
import { defineRoutes } from '../../common/index.js'
import { BSON } from 'mongodb'

export const contestAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (!hasCapability(req._planCapability, PlanCapacity.CAP_ADMIN)) {
      return rep.forbidden()
    }
  })

  s.post(
    '/',
    {
      schema: {
        body: Type.Object({
          contestId: Type.String(),
          settings: SPlanContestSettings
        })
      }
    },
    async (req, rep) => {
      const contestId = new BSON.UUID(req.body.contestId)
      const exists = await contests.countDocuments({
        _id: contestId,
        orgId: req._plan.orgId
      })
      if (!exists) return rep.notFound()
      const { modifiedCount } = await plans.updateOne(
        { _id: req._plan._id, 'contests.contestId': { $ne: contestId } },
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
        params: Type.Object({
          contestId: Type.String()
        }),
        response: { 200: SPlanContestSettings }
      }
    },
    async (req, rep) => {
      const contest = req._plan.contests.find(({ contestId }) =>
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
        params: Type.Object({
          contestId: Type.String()
        }),
        body: SPlanContestSettings
      }
    },
    async (req, rep) => {
      const contestId = new BSON.UUID(req.params.contestId)
      const { modifiedCount } = await plans.updateOne(
        { _id: req._plan._id, 'contests.contestId': contestId },
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
        params: Type.Object({
          contestId: Type.String()
        })
      }
    },
    async (req, rep) => {
      const contestId = new BSON.UUID(req.params.contestId)
      const { modifiedCount } = await plans.updateOne(
        { _id: req._plan._id },
        { $pull: { contests: { contestId } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})
