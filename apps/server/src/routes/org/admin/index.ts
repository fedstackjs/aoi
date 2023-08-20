import { CAP_NONE, ensureCapability } from '../../../utils/capability.js'
import { defineRoutes } from '../../common/index.js'
import { OrgCapability, orgs } from '../../../db/index.js'
import { Type } from '@sinclair/typebox'
import { IOrgOssSettings, SOrgSettings } from '../../../index.js'
import { orgAdminMemberRoutes } from './member.js'
import { orgAdminRunnerRoutes } from './runner.js'

function ossSettingsToUpdate(oss: IOrgOssSettings) {
  const $set: Record<string, unknown> = oss
  if (!$set.secretKey) delete $set.secretKey
  return Object.fromEntries(Object.entries($set).map(([k, v]) => [`settings.oss.${k}`, v]))
}

export const orgAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    const capability = req._orgMembership?.capability ?? CAP_NONE
    ensureCapability(capability, OrgCapability.CAP_ADMIN, s.httpErrors.forbidden())
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
      const org = await orgs.findOne({ _id: req._orgId }, { projection: { settings: 1 } })
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
        body: Type.Partial(SOrgSettings)
      }
    },
    async (req) => {
      const { oss, ...rest } = req.body
      let $set = rest
      if (oss) {
        $set = { ...$set, ...ossSettingsToUpdate(oss) }
      }
      await orgs.updateOne({ _id: req._orgId }, { $set })
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
