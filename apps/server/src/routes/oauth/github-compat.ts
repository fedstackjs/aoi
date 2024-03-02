import { Type } from '@sinclair/typebox'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { orgMemberships, users } from '../../index.js'

export const oauthGithubCompatRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('github-compat'))

  s.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Object({})
        }
      }
    },
    () => ({})
  )

  s.get(
    '/user',
    {
      schema: {
        response: {
          200: Type.Object({
            login: Type.String(),
            email: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const user = await users.findOne(
        { _id: req.user.userId },
        { projection: { 'profile.name': 1, 'profile.email': 1 } }
      )
      if (!user) return rep.notFound()
      return {
        login: user.profile.name,
        email: user.profile.email
      }
    }
  )

  s.get(
    '/user/emails',
    {
      schema: {
        response: {
          200: Type.Array(
            Type.Object({
              email: Type.String(),
              primary: Type.Boolean(),
              verified: Type.Boolean()
            })
          )
        }
      }
    },
    async (req, rep) => {
      const user = await users.findOne(
        { _id: req.user.userId },
        { projection: { 'profile.email': 1, 'authSources.mail': 1 } }
      )
      if (!user) return rep.notFound()
      return [
        {
          email: user.profile.email,
          primary: true,
          verified: !!user.authSources.mail
        }
      ]
    }
  )

  s.get(
    '/user/orgs',
    {
      schema: {
        querystring: Type.Object({
          per_page: Type.Integer({ maximum: 100, minimum: 100 }),
          page: Type.Integer()
        }),
        response: {
          200: Type.Array(
            Type.Object({
              login: Type.String()
            })
          )
        }
      }
    },
    async (req) => {
      const skip = (req.query.page - 1) * req.query.per_page
      const limit = req.query.per_page
      const orgs = await orgMemberships
        .aggregate([
          { $match: { userId: req.user.userId } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'orgs',
              localField: 'orgId',
              foreignField: '_id',
              as: 'org'
            }
          },
          { $unwind: '$org' },
          { $replaceRoot: { newRoot: '$org' } },
          { $project: { 'profile.name': 1 } }
        ])
        .toArray()
      return orgs.map((org) => ({ login: org.profile.name }))
    }
  )

  s.get(
    '/user/teams',
    {
      schema: {
        querystring: Type.Object({
          per_page: Type.Integer(),
          page: Type.Integer()
        }),
        response: {
          200: Type.Array(
            Type.Object({
              name: Type.String(),
              slug: Type.String(),
              organization: Type.Object({
                login: Type.String()
              })
            })
          )
        }
      }
    },
    async (req) => {
      const skip = (req.query.page - 1) * req.query.per_page
      const limit = req.query.per_page
      const groups = await orgMemberships
        .aggregate([
          { $match: { userId: req.user.userId } },
          {
            $lookup: {
              from: 'groups',
              localField: 'groups',
              foreignField: '_id',
              as: 'group'
            }
          },
          { $unwind: '$group' },
          { $replaceRoot: { newRoot: '$group' } },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: 'orgs',
              localField: 'orgId',
              foreignField: '_id',
              as: 'org'
            }
          },
          { $unwind: '$org' },
          { $project: { _id: 1, 'profile.name': 1, 'org.profile.name': 1 } }
        ])
        .toArray()
      return groups.map((group) => ({
        name: group.profile.name,
        slug: group._id,
        organization: { login: group.org.profile.name }
      }))
    }
  )
})
