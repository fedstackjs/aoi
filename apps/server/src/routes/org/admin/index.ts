import { ORG_CAPS } from '../../../db/index.js'
import { IOrgOssSettings, SOrgProfile, SOrgSettings } from '../../../index.js'
import { T } from '../../../schemas/index.js'
import { CAP_NONE, ensureCapability } from '../../../utils/capability.js'
import { defineRoutes } from '../../common/index.js'
import { kOrgContext } from '../inject.js'

import { orgAdminMemberRoutes } from './member.js'
import { orgAdminRunnerRoutes } from './runner.js'

function ossSettingsToUpdate(oss: IOrgOssSettings) {
  const $set: Record<string, unknown> = oss
  if (!$set.secretKey) delete $set.secretKey
  return Object.fromEntries(Object.entries($set).map(([k, v]) => [`settings.oss.${k}`, v]))
}

export const orgAdminRoutes = defineRoutes(async (s) => {
  const { orgs } = s.db

  s.addHook('onRequest', async (req) => {
    const ctx = req.inject(kOrgContext)
    const capability = ctx._orgMembership?.capability ?? CAP_NONE
    ensureCapability(capability, ORG_CAPS.CAP_ADMIN, s.httpErrors.forbidden())
  })

  s.register(orgAdminMemberRoutes, { prefix: '/member' })

  s.patch(
    '/ownership',
    {
      schema: {}
    },
    async () => {
      // TODO: change ownership
      throw s.httpErrors.notImplemented()
    }
  )

  s.get(
    '/settings',
    {
      schema: {
        response: {
          200: SOrgSettings
        }
      }
    },
    async (req, rep) => {
      const ctx = req.inject(kOrgContext)
      const org = await orgs.findOne({ _id: ctx._orgId }, { projection: { settings: 1 } })
      if (!org) return rep.notFound()
      if (org.settings.oss) {
        org.settings.oss.secretKey = ''
      }
      return org.settings
    }
  )

  s.patch(
    '/settings',
    {
      schema: {
        body: T.Partial(SOrgSettings)
      }
    },
    async (req) => {
      const ctx = req.inject(kOrgContext)
      const { oss, ...rest } = req.body
      let $set = rest
      if (oss) {
        $set = { ...$set, ...ossSettingsToUpdate(oss) }
      }
      await orgs.updateOne({ _id: ctx._orgId }, { $set })
      return {}
    }
  )

  s.get(
    '/profile',
    {
      schema: {
        response: {
          200: SOrgProfile
        }
      }
    },
    async (req) => {
      const ctx = req.inject(kOrgContext)
      const org = await orgs.findOne({ _id: ctx._orgId }, { projection: { profile: 1 } })
      if (!org) throw s.httpErrors.badRequest()
      return org.profile
    }
  )

  s.patch(
    '/profile',
    {
      schema: {
        body: SOrgProfile
      }
    },
    async (req) => {
      const ctx = req.inject(kOrgContext)
      await orgs.updateOne({ _id: ctx._orgId }, { $set: { profile: req.body } })
      return {}
    }
  )

  s.delete(
    '/',
    {
      schema: {}
    },
    async () => {
      // TODO: delete org
      throw s.httpErrors.notImplemented()
    }
  )

  s.register(orgAdminRunnerRoutes, { prefix: '/runner' })
})
