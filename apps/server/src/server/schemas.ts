import { SProblemConfigSchema } from '@aoi-js/common'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

import { T } from '../index.js'

const schemas = Object.fromEntries(
  Object.entries({
    'problem-config.json': SProblemConfigSchema
  }).map(([name, schema]) => [name, JSON.stringify(schema)])
)

export const schemaRoutes: FastifyPluginAsyncTypebox = async (s) => {
  s.get(
    '/:name',
    {
      schema: {
        params: T.Object({ name: T.String() })
      }
    },
    (req, rep) => {
      if (!Object.hasOwn(schemas, req.params.name)) return rep.notFound()
      return rep.header('content-type', 'application/json').send(schemas[req.params.name])
    }
  )
}
