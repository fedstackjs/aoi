import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../../common/index.js'
import { contests } from '../../../index.js'

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
              tags: Type.Array(Type.String())
            })
          )
        }
      }
    },
    async (req) => {
      const $in = req._plan.contests.map((contest) => contest.contestId)
      const list = await contests
        .find({ _id: { $in } }, { projection: { title: 1, slug: 1, tags: 1 } })
        .toArray()
      return list
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
})
