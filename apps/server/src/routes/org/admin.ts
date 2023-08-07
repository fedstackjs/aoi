import { BSON } from 'mongodb'
import { CAP_NONE, ensureCapability } from '../../utils/capability.js'
import { defineRoutes } from '../common/index.js'
import { OrgCapability } from '../../db/index.js'
import { Type } from '@sinclair/typebox'

export const orgAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    const capability = req._orgMembership?.capability ?? CAP_NONE
    ensureCapability(capability, OrgCapability.CAP_ADMIN, s.httpErrors.forbidden())
  })

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

  s.patch(
    '/settings',
    {
      schema: {}
    },
    async () => {
      // TODO: update settings
      throw s.httpErrors.notImplemented()
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

  s.post(
    '/runner/register',
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

  s.get('/runner/list', {}, async (req, rep) => rep.notImplemented())
})
