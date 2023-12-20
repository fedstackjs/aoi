import { Type } from '@sinclair/typebox'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { BSON } from 'mongodb'
import { createHash } from 'node:crypto'
import { groups, users } from '../../db/index.js'

export const publicRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('public'))
  s.addHook('onRoute', (route) => {
    ;(route.schema ??= {}).security = []
  })

  s.post(
    '/fetch-principals-profiles',
    {
      schema: {
        description: 'Batch fetch principal profiles',
        body: Type.Object({
          principalIds: Type.Array(Type.UUID())
        }),
        response: {
          200: Type.Array(
            Type.Object({
              principalId: Type.UUID(),
              name: Type.String(),
              emailHash: Type.String()
            }),
            { maxItems: 50 }
          )
        }
      }
    },
    async (req) => {
      const principalIds = req.body.principalIds.map((id) => new BSON.UUID(id))
      const matchedUsers = await users
        .find(
          { _id: { $in: principalIds } },
          {
            projection: {
              'profile.name': 1,
              'profile.email': 1
            }
          }
        )
        .toArray()
      const matchedGroups = await groups
        .find(
          { _id: { $in: principalIds } },
          {
            projection: {
              name: 1,
              email: 1
            }
          }
        )
        .toArray()
      const result = [...matchedUsers, ...matchedGroups].map(
        ({ _id, profile: { name, email } }) => ({
          principalId: _id,
          name,
          emailHash: createHash('md5').update(email).digest('hex')
        })
      )
      return result
    }
  )
})
