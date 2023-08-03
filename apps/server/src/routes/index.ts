import { authRoutes } from './auth/index.js'
import { userRoutes } from './user/index.js'
import { orgRoutes } from './org/index.js'
import { adminRoutes } from './admin/index.js'
import { defineRoutes } from './common/index.js'
import { problemRoutes } from './problem/index.js'
import { solutionRoutes } from './solution/index.js'

export const apiRoutes = defineRoutes(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (Array.isArray(req.routeSchema.security) && !req.routeSchema.security.length) return
    try {
      await req.jwtVerify()
    } catch (err) {
      rep.send(err)
    }
  })

  s.get(
    '/ping',
    {
      schema: {
        description: 'Server health check',
        security: []
      }
    },
    async () => ({ ping: 'pong' })
  )
  s.register(authRoutes, { prefix: '/auth' })
  s.register(userRoutes, { prefix: '/user' })
  s.register(orgRoutes, { prefix: '/org' })
  s.register(problemRoutes, { prefix: '/problem' })
  s.register(solutionRoutes, { prefix: '/solution' })
  s.register(adminRoutes, { prefix: '/admin' })
})
