import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../../common/index.js'
import { SContestProblemSettings } from '../../../schemas/contest.js'
import { BSON } from 'mongodb'
import { ContestCapability, contests, problems } from '../../../db/index.js'
import { hasCapability } from '../../../utils/index.js'

export const problemAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (!hasCapability(req._contestCapability, ContestCapability.CAP_ADMIN)) {
      return rep.forbidden()
    }
  })

  s.post(
    '/',
    {
      schema: {
        body: Type.Object({
          problemId: Type.String(),
          settings: SContestProblemSettings
        })
      }
    },
    async (req, rep) => {
      const problemId = new BSON.UUID(req.body.problemId)
      const exists = await problems.countDocuments({
        _id: problemId,
        orgId: req._contest.orgId
      })
      if (!exists) return rep.notFound()
      const { modifiedCount } = await contests.updateOne(
        { _id: req._contestId, 'problems.problemId': { $ne: problemId } },
        { $push: { problems: { problemId, settings: req.body.settings } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )
  s.patch(
    '/:problemId/settings',
    {
      schema: {
        params: Type.Object({
          problemId: Type.String()
        }),
        body: SContestProblemSettings
      }
    },
    async (req, rep) => {
      const problemId = new BSON.UUID(req.params.problemId)
      const { modifiedCount } = await contests.updateOne(
        { _id: req._contestId, 'problems.problemId': problemId },
        { $set: { 'problems.$.settings': req.body } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
  s.delete(
    '/:problemId',
    {
      schema: {
        params: Type.Object({
          problemId: Type.String()
        })
      }
    },
    async (req, rep) => {
      const problemId = new BSON.UUID(req.params.problemId)
      const { modifiedCount } = await contests.updateOne(
        { _id: req._contestId },
        { $pull: { problems: { problemId } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
})
