import { authRoutes } from './auth/index.js'
import { userRoutes } from './user/index.js'
import { orgRoutes } from './org/index.js'
import { adminRoutes } from './admin/index.js'
import { defineRoutes } from './common/index.js'

export const apiRoutes = defineRoutes(async (s) => {
  s.get('/ping', async () => ({ ping: 'pong' }))
  s.register(authRoutes, { prefix: '/auth' })
  s.register(userRoutes, { prefix: '/user' })
  s.register(orgRoutes, { prefix: '/org/:orgId' })
  s.register(orgRoutes, { prefix: '/group/:groupId' })
  s.register(adminRoutes, { prefix: '/admin' })
})
