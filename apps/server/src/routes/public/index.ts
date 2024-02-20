import { Type } from '@sinclair/typebox'
import { defineRoutes, md5, swaggerTagMerger } from '../common/index.js'
import { BSON } from 'mongodb'
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
              principalType: Type.StringEnum(['user', 'group']),
              name: Type.String(),
              emailHash: Type.String(),
              namespace: Type.Optional(Type.String()),
              tags: Type.Optional(Type.Array(Type.String()))
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
              'profile.email': 1,
              namespace: 1,
              tags: 1
            }
          }
        )
        .toArray()
      const matchedGroups = await groups
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
      const result = [
        ...matchedUsers.map(({ _id, profile: { name, email }, namespace, tags }) => ({
          principalId: _id,
          principalType: 'user' as const,
          name,
          emailHash: md5(email),
          namespace,
          tags
        })),
        ...matchedGroups.map(({ _id, profile: { name, email } }) => ({
          principalId: _id,
          principalType: 'group' as const,
          name,
          emailHash: md5(email)
        }))
      ]
      return result
    }
  )
})
