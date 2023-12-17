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
    '/fetch-principles-profiles',
    {
      schema: {
        description: 'Batch fetch principle profiles',
        body: Type.Object({
          principleIds: Type.Array(Type.UUID())
        }),
        response: {
          200: Type.Array(
            Type.Object({
              principleId: Type.UUID(),
              name: Type.String(),
              emailHash: Type.String()
            }),
            { maxItems: 50 }
          )
        }
      }
    },
    async (req) => {
      const principleIds = req.body.principleIds.map((id) => new BSON.UUID(id))
      const matchedUsers = await users
        .find(
          { _id: { $in: principleIds } },
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
          { _id: { $in: principleIds } },
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
          principleId: _id,
          name,
          emailHash: createHash('md5').update(email).digest('hex')
        })
      )
      return result
    }
  )
})
