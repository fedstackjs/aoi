import { USER_CAPS, hasCapability } from '../../index.js'
import { T } from '../../schemas/index.js'
import { loadUserCapability } from '../common/access.js'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'

export const infoRoutes = defineRoutes(async (s) => {
  const { infos } = s.db

  s.addHook('onRoute', swaggerTagMerger('info'))

  s.get(
    '/milestone',
    {
      schema: {
        description: 'List milestones',
        response: {
          200: T.Object({
            csp: T.String(),
            noip: T.String()
          })
        },
        security: []
      }
    },
    async (req, rep) => {
      const info = await infos.findOne()
      if (!info) return rep.notFound()
      return info.milestone
    }
  )

  s.patch(
    '/milestone',
    {
      schema: {
        description: 'Update milestones',
        body: T.Object({
          csp: T.String(),
          noip: T.String()
        })
      }
    },
    async (req, rep) => {
      const capability = await loadUserCapability(req)
      if (!hasCapability(capability, USER_CAPS.CAP_ADMIN)) return rep.forbidden()
      const { csp, noip } = req.body
      const info = await infos.findOne()
      if (!info) return rep.notFound()
      await infos.updateOne({ _id: info._id }, { $set: { milestone: { csp: csp, noip: noip } } })
      return { ok: 1 }
    }
  )

  s.get(
    '/friends',
    {
      schema: {
        description: 'List friends',
        response: {
          200: T.Array(
            T.Object({
              title: T.String(),
              url: T.String()
            })
          )
        },
        security: []
      }
    },
    async (req, rep) => {
      const info = await infos.findOne()
      if (!info) return rep.notFound()
      return info.friends
    }
  )

  s.patch(
    '/friends',
    {
      schema: {
        description: 'Update friends',
        body: T.Array(
          T.Object({
            title: T.String(),
            url: T.String()
          })
        )
      }
    },
    async (req, rep) => {
      const capability = await loadUserCapability(req)
      if (!hasCapability(capability, USER_CAPS.CAP_ADMIN)) return rep.forbidden()
      const friends = req.body
      const info = await infos.findOne()
      if (!info) return rep.notFound()
      await infos.updateOne({ _id: info._id }, { $set: { friends: friends } })
      return { ok: 1 }
    }
  )

  s.get(
    '/posters',
    {
      schema: {
        description: 'List posters',
        response: {
          200: T.Array(
            T.Object({
              title: T.String(),
              url: T.String()
            })
          )
        },
        security: []
      }
    },
    async (req, rep) => {
      const info = await infos.findOne()
      if (!info) return rep.notFound()
      return info.posters
    }
  )

  s.patch(
    '/posters',
    {
      schema: {
        description: 'Update posters',
        body: T.Array(
          T.Object({
            title: T.String(),
            url: T.String()
          })
        )
      }
    },
    async (req, rep) => {
      const capability = await loadUserCapability(req)
      if (!hasCapability(capability, USER_CAPS.CAP_ADMIN)) return rep.forbidden()
      const posters = req.body
      const info = await infos.findOne()
      if (!info) return rep.notFound()
      await infos.updateOne({ _id: info._id }, { $set: { posters: posters } })
      return { ok: 1 }
    }
  )

  s.get(
    '/defaultOrg',
    {
      schema: {
        description: 'List default org',
        response: {
          200: T.Object({
            defaultOrg: T.String()
          })
        },
        security: []
      }
    },
    async (req, rep) => {
      const info = await infos.findOne()
      if (!info) return rep.notFound()
      return { defaultOrg: info.regDefaultOrg ?? '' }
    }
  )

  s.patch(
    '/defaultOrg',
    {
      schema: {
        description: 'Update default org',
        body: T.Object({
          defaultOrg: T.String()
        })
      }
    },
    async (req, rep) => {
      const capability = await loadUserCapability(req)
      if (!hasCapability(capability, USER_CAPS.CAP_ADMIN)) return rep.forbidden()
      const defaultOrg = req.body.defaultOrg
      const info = await infos.findOne()
      if (!info) return rep.notFound()
      await infos.updateOne({ _id: info._id }, { $set: { regDefaultOrg: defaultOrg } })
      return { ok: 1 }
    }
  )
})
