import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../../common/index.js'
import { SPlanContestSettings, contests } from '../../../index.js'
import { contestAdminRoutes } from './admin.js'

export const planContestRoutes = defineRoutes(async (s) => {
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
              slug: Type.String(),
              tags: Type.Array(Type.String()),
              settings: SPlanContestSettings
            })
          )
        }
      }
    },
    async (req) => {
      const config = req._plan.contests
      const $in = config.map((contest) => contest.contestId)
      const list = await contests
        .find({ _id: { $in } }, { projection: { title: 1, slug: 1, tags: 1 } })
        .toArray()
      return list.map((contest) => ({
        ...contest,
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
      return rep.notImplemented()
    }
  )

  s.register(contestAdminRoutes)
})
