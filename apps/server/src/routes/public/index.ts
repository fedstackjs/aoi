import { BSON, Collection } from 'mongodb'

import {
  APP_CAPS,
  CONTEST_CAPS,
  IPrincipalControlable,
  IWithContent,
  ORG_CAPS,
  PROBLEM_CAPS,
  PLAN_CAPS,
  IWithAccessLevel
} from '../../db/index.js'
import { CAP_ALL, hasCapability } from '../../index.js'
import { T } from '../../schemas/index.js'
import { defineRoutes, loadCapability, md5, swaggerTagMerger } from '../common/index.js'

type Resolvable = IPrincipalControlable & IWithContent & IWithAccessLevel & { _id: BSON.UUID }
interface IResolver {
  collection: Collection<Resolvable>
  adminMask: BSON.Long
  capAccess: BSON.Long
  capAdmin: BSON.Long
}

export const publicRoutes = defineRoutes(async (s) => {
  const slugResolvers: Record<string, IResolver> = Object.create(null)
  function addResolver<T extends Resolvable>(
    name: string,
    collection: Collection<T>,
    adminMask: BSON.Long,
    capAccess: BSON.Long,
    capAdmin: BSON.Long
  ) {
    slugResolvers[name] = {
      collection: collection as unknown as Collection<Resolvable>,
      adminMask,
      capAccess,
      capAdmin
    }
  }

  addResolver('app', s.db.apps, ORG_CAPS.CAP_APP, APP_CAPS.CAP_ACCESS, CAP_ALL)
  addResolver('contest', s.db.contests, ORG_CAPS.CAP_CONTEST, CONTEST_CAPS.CAP_ACCESS, CAP_ALL)
  addResolver('plan', s.db.plans, ORG_CAPS.CAP_PLAN, PLAN_CAPS.CAP_ACCESS, CAP_ALL)
  addResolver('problem', s.db.problems, ORG_CAPS.CAP_PROBLEM, PROBLEM_CAPS.CAP_ACCESS, CAP_ALL)
  const slugTypes = Object.keys(slugResolvers)

  const { users, groups } = s.db

  s.addHook('onRoute', swaggerTagMerger('public'))
  s.addHook('onRoute', (route) => {
    ;(route.schema ??= {}).security = []
  })

  s.post(
    '/fetch-principals-profiles',
    {
      schema: {
        description: 'Batch fetch principal profiles',
        body: T.Object({
          principalIds: T.Array(T.UUID())
        }),
        response: {
          200: T.Array(
            T.Object({
              principalId: T.UUID(),
              principalType: T.StringEnum(['user', 'group']),
              name: T.String(),
              emailHash: T.String(),
              orgId: T.Optional(T.UUID()),
              namespace: T.Optional(T.String()),
              tags: T.Optional(T.Array(T.String()))
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
              orgId: 1,
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
        ...matchedGroups.map(({ _id, orgId, profile: { name, email } }) => ({
          principalId: _id,
          principalType: 'group' as const,
          name,
          emailHash: md5(email),
          orgId
        }))
      ]
      return result
    }
  )

  s.post(
    '/resolve-slug',
    {
      schema: {
        body: T.Object({
          orgId: T.UUID(),
          slug: T.String(),
          type: T.String({ enum: slugTypes })
        }),
        response: {
          200: T.Object({
            _id: T.UUID()
          })
        }
      }
    },
    async (req, rep) => {
      const orgId = new BSON.UUID(req.body.orgId)
      const { slug, type } = req.body
      const { collection, adminMask, capAccess, capAdmin } = slugResolvers[type]
      const result = await collection.findOne(
        { orgId, slug },
        { projection: { _id: 1, accessLevel: 1, associations: 1 } }
      )
      if (!result) return rep.notFound()
      const membership = await req.loadMembership(orgId)
      const capability = loadCapability(result, membership, adminMask, capAccess, capAdmin)
      if (!hasCapability(capability, capAccess)) return rep.notFound()
      return { _id: result._id }
    }
  )
})
