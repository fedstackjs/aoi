import { Type } from '@sinclair/typebox'
import { CONTEST_CAPS, contestParticipants, findPaginated, hasCapability } from '../../../index.js'
import { defineRoutes } from '../../common/index.js'
import { kContestContext } from '../inject.js'
import { BSON } from 'mongodb'

export const contestParticipantRoutes = defineRoutes(async (s) => {
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
        querystring: Type.Object({
          page: Type.Integer({ minimum: 1, default: 1 }),
          perPage: Type.Integer({ enum: [15, 30, 50, 100] }),
          count: Type.Boolean({ default: false })
        }),
        response: {
          200: Type.PaginationResult(
            Type.Object({
              _id: Type.UUID(),
              userId: Type.UUID(),
              tags: Type.Optional(Type.Array(Type.String()))
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
        params: Type.Object({
          userId: Type.UUID()
        }),
        response: {
          200: Type.Object({
            tags: Type.Optional(Type.Array(Type.String()))
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
        params: Type.Object({
          userId: Type.UUID()
        }),
        body: Type.Object({
          tags: Type.Optional(Type.Array(Type.String()))
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

  s.delete('/:userId', {}, async () => {
    // TODO: delete participant
    return s.httpErrors.notImplemented()
  })
})
