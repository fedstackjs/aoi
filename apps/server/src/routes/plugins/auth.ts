import { fastifyPlugin } from 'fastify-plugin'

export const apiUserAuthPlugin = fastifyPlugin(async (s) => {
  s.addHook('onRequest', async (req, rep) => {
    if (req.headers.authorization) {
      // Allow type token which is a alias of bearer
      if (/^Token\s/i.test(req.headers.authorization)) {
        req.headers.authorization = req.headers.authorization.replace(/^Token\s/i, 'Bearer ')
      }
      await req.jwtVerify()

      // Only allow tagged routes
      if (req.user.tags) {
        const tags = new Set(req.user.tags)
        if (!req.routeOptions.schema?.tags?.some((tag) => tags.has(tag))) return rep.forbidden()
      }
    }

    // Check JWT
    const security = req.routeOptions.schema?.security
    if (!security || security.some((sec) => Object.hasOwn(sec, 'bearerAuth'))) {
      if (!req.user) return rep.forbidden()
    }
  })
})
