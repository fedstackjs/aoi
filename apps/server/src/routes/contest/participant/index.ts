import { Type } from '@sinclair/typebox'
import {
  ContestCapability,
  contestParticipants,
  findPaginated,
  hasCapability
} from '../../../index.js'
import { defineRoutes } from '../../common/index.js'
import { kContestContext } from '../inject.js'

export const contestParticipantRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kContestContext)
    const { participantEnabled } = ctx._contestStage.settings
    if (participantEnabled) return
    if (hasCapability(ctx._contestCapability, ContestCapability.CAP_ADMIN)) return
    return rep.forbidden()
  })

  s.get(
    '/',
    {
      schema: {
        description: 'List contest participants',
        querystring: Type.Object({
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(Type.Object({}))
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kContestContext)
      return findPaginated(
        contestParticipants,
        req.query.page,
        req.query.perPage,
        req.query.count,
        {
          _contestId: ctx._contestId
        },
        {
          projection: {
            _id: 1,
            userId: 1,
            tags: 1
          }
        }
      )
    }
  )
})
