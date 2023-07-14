import { FastifyPluginAsyncTypebox, TSchema, Type } from '@fastify/type-provider-typebox'

const orgIdSchema = Type.Object({
  orgId: Type.String()
})

export const orgRoutes: FastifyPluginAsyncTypebox = async (srv) => {
  srv.decorateRequest('orgId', '')

  srv.addHook('onRoute', (route) => {
    const oldParams = route.schema?.params
    if (oldParams) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      route.schema!.params = Type.Intersect([oldParams as TSchema, orgIdSchema])
    } else {
      ;(route.schema ??= {}).params = orgIdSchema
    }
  })

  srv.addHook('onRequest', async (req, rep) => {
    try {
      await req.jwtVerify()
      const { orgId } = req.params as Record<string, string>
      console.log(orgId)
    } catch (err) {
      rep.send(err)
    }
  })

  srv.get('/', async () => {
    return ''
  })
}
