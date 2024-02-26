import { USER_CAPS, hasCapability } from '../../index.js'
import { packageJson } from '../../utils/package.js'
import { loadUserCapability } from '../common/access.js'
import { defineRoutes, swaggerTagMerger } from '../common/index.js'
import { adminUserRoutes } from './user.js'

export const adminRoutes = defineRoutes(async (s) => {
  s.addHook('onRoute', swaggerTagMerger('admin'))

  s.addHook('onRequest', async (req, rep) => {
    const capability = await loadUserCapability(req)
    if (!hasCapability(capability, USER_CAPS.CAP_ADMIN)) return rep.forbidden()
  })

  s.get('/', async () => {
    return {
      serverVersion: packageJson.version
    }
  })

  s.register(adminUserRoutes, { prefix: '/user' })
})
