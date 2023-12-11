import { ProblemCapability, problems } from '../../db/index.js'
import { defineRoutes } from '../common/index.js'
import { ensureCapability } from '../../utils/capability.js'
import { manageACL, manageAccessLevel } from '../common/access.js'
import { SProblemSettings } from '../../index.js'
import { manageSettings } from '../common/settings.js'
import { kProblemContext } from './inject.js'

export const problemAdminRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req) => {
    ensureCapability(
      req.inject(kProblemContext)._problemCapability,
      ProblemCapability.CAP_ADMIN,
      s.httpErrors.forbidden()
    )
  })

  s.register(manageACL, {
    collection: problems,
    resolve: async (req) => req.inject(kProblemContext)._problem._id,
    defaultCapability: ProblemCapability.CAP_ACCESS,
    prefix: '/access'
  })
  s.register(manageAccessLevel, {
    collection: problems,
    resolve: async (req) => req.inject(kProblemContext)._problem._id,
    prefix: '/accessLevel'
  })

  s.register(manageSettings, {
    collection: problems,
    resolve: async (req) => req.inject(kProblemContext)._problem._id,
    schema: SProblemSettings,
    prefix: '/settings'
  })

  s.delete(
    '/',
    {
      schema: {
        description: 'Delete problem'
      }
    },
    async (req) => {
      // TODO: handle dependencies
      await problems.deleteOne({ _id: req.inject(kProblemContext)._problem._id })
      return {}
    }
  )
})
