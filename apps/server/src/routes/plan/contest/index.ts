import { Type } from '@sinclair/typebox'
import { defineRoutes, tryLoadUUID } from '../../common/index.js'
import { IContestParticipant, evalTagRules, getCurrentContestStage } from '../../../db/index.js'
import {
  IPlanContestPrecondition,
  SContestStage,
  SPlanContestSettings
} from '../../../schemas/index.js'
import { contestAdminRoutes } from './admin.js'
import { BSON } from 'mongodb'
import { kPlanContext } from '../inject.js'

export async function testPrecondition(
  cond: IPlanContestPrecondition,
  participant: IContestParticipant
) {
  if (cond.minTotalScore) {
    const totalScore = Object.values(participant.results).reduce(
      (sum, { lastSolution }) => sum + lastSolution.score,
      0
    )
    if (totalScore < cond.minTotalScore) return `Total score ${totalScore} < ${cond.minTotalScore}`
  }
  if (cond.problems) {
    for (const { problemId, minScore } of cond.problems) {
      const result = participant.results[problemId]
      if (!result || result.lastSolution.score < minScore) return `Problem ${problemId} not passed`
    }
  }
  return ''
}

const planContestViewRoutes = defineRoutes(async (s) => {
  const { contests, contestParticipants, users } = s.db

  s.get(
    '/',
    {
      schema: {
        description: 'Get contest list',
        response: {
          200: Type.Array(
            Type.Object({
              _id: Type.UUID(),
              title: Type.String(),
              description: Type.String(),
              slug: Type.String(),
              tags: Type.Array(Type.String()),
              stages: Type.Array(Type.Pick(SContestStage, ['name', 'start'] as const)),
              currentStage: SContestStage,
              settings: SPlanContestSettings
            })
          )
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kPlanContext)

      const config = ctx._plan.contests
      const $in = config.map((contest) => contest.contestId)
      const list = await contests
        .find(
          { _id: { $in } },
          { projection: { title: 1, slug: 1, description: 1, tags: 1, stages: 1 } }
        )
        .toArray()
      return list.map((contest) => ({
        ...contest,
        currentStage: getCurrentContestStage(req._now, contest),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        settings: config.find(({ contestId }) => contestId.equals(contest._id))!.settings
      }))
    }
  )

  s.post(
    '/:contestId/register',
    {
      schema: {
        description: 'Register to contest',
        response: {
          200: Type.Object({})
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kPlanContext)
      if (!ctx._planParticipant) return rep.preconditionFailed(`Not registered to plan`)

      const contestId = tryLoadUUID(req.params, 'contestId')
      if (!contestId) return rep.notFound()
      const config = ctx._plan.contests.find(({ contestId: id }) => id.equals(contestId))
      if (!config) return rep.notFound()
      for (const { contestId, conditions } of config.settings.preConditionContests ?? []) {
        const participant = await contestParticipants.findOne({
          contestId: new BSON.UUID(contestId),
          userId: req.user.userId
        })
        if (!participant) return rep.preconditionFailed(`Not registered to contest ${contestId}`)
        const errorMsg = await testPrecondition(conditions, participant)
        if (errorMsg) return rep.preconditionFailed(errorMsg)
      }
      const contest = await contests.findOne({ _id: contestId })
      if (!contest) return rep.notFound()
      const stage = getCurrentContestStage(Date.now(), contest)
      if (!stage.settings.registrationEnabled) return rep.preconditionFailed(`Registration closed`)
      const user = await users.findOne({ _id: req.user.userId })
      if (!user) return rep.notFound()
      await contestParticipants.insertOne(
        {
          _id: new BSON.UUID(),
          userId: req.user.userId,
          contestId: contestId,
          results: {},
          tags: await evalTagRules(stage, user),
          createdAt: req._now,
          updatedAt: req._now
        },
        { ignoreUndefined: true }
      )

      // TODO: see contest register
      await contests.updateOne({ _id: contestId }, { $inc: { participantCount: 1 } })
      return {}
    }
  )
})

export const planContestRoutes = defineRoutes(async (s) => {
  s.register(planContestViewRoutes)
  s.register(contestAdminRoutes)
})
