import { BSON } from 'mongodb'

import { CONTEST_CAPS } from '../../../db/index.js'
import { T } from '../../../schemas/index.js'
import { findPaginated, hasCapability } from '../../../utils/index.js'
import { defineRoutes } from '../../common/index.js'
import { kContestContext } from '../inject.js'

export const contestParticipantRoutes = defineRoutes(async (s) => {
  const { contestParticipants } = s.db

  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kContestContext)
    const { participantEnabled } = ctx._contestStage.settings
    if (participantEnabled) return
    if (hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)) return
    return rep.forbidden()
  })

  s.get(
    '/',
    {
      schema: {
        description: 'List contest participants',
        querystring: T.Object({
          page: T.Integer({ minimum: 1, default: 1 }),
          perPage: T.Integer({ enum: [15, 30, 50, 100] }),
          count: T.Boolean({ default: false })
        }),
        response: {
          200: T.PaginationResult(
            T.Object({
              _id: T.UUID(),
              userId: T.UUID(),
              tags: T.Optional(T.Array(T.String()))
            })
          )
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
          contestId: ctx._contestId
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

  s.register(contestParticipantAdminRoutes, { prefix: '/admin' })
})

const contestParticipantAdminRoutes = defineRoutes(async (s) => {
  const { contestParticipants } = s.db

  s.addHook('onRequest', async (req, rep) => {
    const ctx = req.inject(kContestContext)
    if (!hasCapability(ctx._contestCapability, CONTEST_CAPS.CAP_ADMIN)) {
      return rep.forbidden()
    }
  })

  s.post(
    '/import',
    {
      schema: {
        description: 'Import participants'
      }
    },
    async () => {
      // TODO: implement import participants
      return s.httpErrors.notImplemented()
    }
  )

  s.get(
    '/:userId',
    {
      schema: {
        description: 'Get participant',
        params: T.Object({
          userId: T.UUID()
        }),
        response: {
          200: T.Object({
            tags: T.Optional(T.Array(T.String()))
          })
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kContestContext)
      const userId = new BSON.UUID(req.params.userId)
      const participant = await contestParticipants.findOne({
        contestId: ctx._contestId,
        userId
      })
      if (!participant) throw s.httpErrors.notFound()
      return participant
    }
  )

  s.patch(
    '/:userId',
    {
      schema: {
        description: 'Update participant',
        params: T.Object({
          userId: T.UUID()
        }),
        body: T.Object({
          tags: T.Optional(T.Array(T.String())),
          banned: T.Optional(T.Boolean())
        })
      }
    },
    async (req) => {
      const ctx = req.inject(kContestContext)
      const userId = new BSON.UUID(req.params.userId)
      await contestParticipants.updateOne({ contestId: ctx._contestId, userId }, [
        {
          $set: {
            tags: req.body.tags,
            updatedAt: { $convert: { input: '$$NOW', to: 'double' } }
          }
        }
      ])
      return 0
    }
  )
})
