import { BSON } from 'mongodb'

import { T } from '../../../schemas/index.js'
import { defineRoutes } from '../../common/index.js'
import { kOrgContext } from '../inject.js'

export const orgAdminRunnerRoutes = defineRoutes(async (s) => {
  const { runners } = s.db

  s.post(
    '/register',
    {
      schema: {
        description: 'Register a new runner',
        response: {
          200: T.Object({
            registrationToken: T.String()
          })
        }
      }
    },
    async (req, rep) => {
      const payload = {
        orgId: req.inject(kOrgContext)._orgId,
        runnerId: new BSON.UUID()
      }
      const token = await rep.jwtSign(payload, { expiresIn: '5min' })
      return { registrationToken: token }
    }
  )

  s.get(
    '/',
    {
      schema: {
        response: {
          200: T.Array(
            T.Object({
              _id: T.UUID(),
              labels: T.Array(T.String()),
              name: T.String(),
              version: T.String(),
              message: T.String(),
              ip: T.String(),
              createdAt: T.Number(),
              accessedAt: T.Number()
            })
          )
        }
      }
    },
    async (req) => {
      const list = await runners.find({ orgId: req.inject(kOrgContext)._orgId }).toArray()
      return list
    }
  )

  s.get(
    '/:runnerId',
    {
      schema: {
        params: T.Object({
          runnerId: T.UUID()
        }),
        response: {
          200: T.Object({
            _id: T.UUID(),
            labels: T.Array(T.String()),
            name: T.String(),
            version: T.String(),
            message: T.String(),
            ip: T.String(),
            createdAt: T.Number(),
            accessedAt: T.Number()
          })
        }
      }
    },
    async (req, rep) => {
      const runner = await runners.findOne({
        _id: new BSON.UUID(req.params.runnerId),
        orgId: req.inject(kOrgContext)._orgId
      })
      if (!runner) return rep.notFound()
      return runner
    }
  )

  s.patch(
    '/:runnerId',
    {
      schema: {
        params: T.Object({
          runnerId: T.UUID()
        }),
        body: T.Partial(
          T.StrictObject({
            labels: T.Array(T.String()),
            name: T.String()
          })
        )
      }
    },
    async (req, rep) => {
      const { modifiedCount } = await runners.updateOne(
        { _id: new BSON.UUID(req.params.runnerId), orgId: req.inject(kOrgContext)._orgId },
        { $set: req.body }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )

  s.delete(
    '/:runnerId',
    {
      schema: {
        params: T.Object({
          runnerId: T.UUID()
        })
      }
    },
    async (req, rep) => {
      // TODO: handle side effects
      const { deletedCount } = await runners.deleteOne({
        _id: new BSON.UUID(req.params.runnerId),
        orgId: req.inject(kOrgContext)._orgId
      })
      if (!deletedCount) return rep.notFound()
      return {}
    }
  )
})
