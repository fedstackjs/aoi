import { problemConfigSchema } from '@aoi-js/common'
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'

const schemas = Object.fromEntries(
  Object.entries({
    'problem-config.json': problemConfigSchema
  }).map(([name, schema]) => [name, JSON.stringify(schema)])
)

export const schemaRoutes: FastifyPluginAsyncTypebox = async (s) => {
  s.get(
    '/:name',
    {
      schema: {
        params: Type.Object({ name: Type.String() })
      }
    },
    (req, rep) => {
      if (!schemas[req.params.name]) return rep.notFound()
      return rep.header('content-type', 'application/json').send(schemas[req.params.name])
    }
  )
}
