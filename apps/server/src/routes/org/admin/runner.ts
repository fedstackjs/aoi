import { Type } from '@sinclair/typebox'
import { defineRoutes } from '../../common/index.js'
import { BSON } from 'mongodb'
import { runners } from '../../../index.js'

export const orgAdminRunnerRoutes = defineRoutes(async (s) => {
  s.post(
    '/register',
    {
      schema: {
        description: 'Register a new runner',
        response: {
          200: Type.Object({
            registrationToken: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const payload = {
        orgId: req._orgId,
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
          200: Type.Array(
            Type.Object({
              _id: Type.UUID(),
              labels: Type.Array(Type.String()),
              name: Type.String(),
              version: Type.String(),
              message: Type.String(),
              createdAt: Type.Number(),
              accessedAt: Type.Number()
            })
          )
        }
      }
    },
    async (req) => {
      const list = await runners.find({ orgId: req._orgId }).toArray()
      return list
    }
  )

  s.get(
    '/:runnerId',
    {
      schema: {
        params: Type.Object({
          runnerId: Type.UUID()
        }),
        response: {
          200: Type.Object({
            _id: Type.UUID(),
            labels: Type.Array(Type.String()),
            name: Type.String(),
            version: Type.String(),
            message: Type.String(),
            createdAt: Type.Number(),
            accessedAt: Type.Number()
          })
        }
      }
    },
    async (req, rep) => {
      const runner = await runners.findOne({
        _id: new BSON.UUID(req.params.runnerId),
        orgId: req._orgId
      })
      if (!runner) return rep.notFound()
      return runner
    }
  )

  s.patch(
    '/:runnerId',
    {
      schema: {
        params: Type.Object({
          runnerId: Type.UUID()
        }),
        body: Type.Partial(
          Type.StrictObject({
            labels: Type.Array(Type.String()),
            name: Type.String()
          })
        )
      }
    },
    async (req, rep) => {
      const { modifiedCount } = await runners.updateOne(
        { _id: new BSON.UUID(req.params.runnerId), orgId: req._orgId },
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
        params: Type.Object({
          runnerId: Type.UUID()
        })
      }
    },
    async (req, rep) => {
      // TODO: handle side effects
      const { deletedCount } = await runners.deleteOne({
        _id: new BSON.UUID(req.params.runnerId),
        orgId: req._orgId
      })
      if (!deletedCount) return rep.notFound()
      return {}
    }
  )
})
