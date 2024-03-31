import { FastifyPluginAsyncTypebox, TSchema } from '@fastify/type-provider-typebox'
import { FastifyRequest } from 'fastify'
import { Collection, UUID } from 'mongodb'

import { T } from '../../schemas/index.js'

import { manageSettings } from './settings.js'

export const manageRules: FastifyPluginAsyncTypebox<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: Collection<any>
  resolve: (req: FastifyRequest) => Promise<UUID | null>
  schemas: Record<string, TSchema>
}> = async (s, { collection, resolve, schemas }) => {
  const ruleSetSpec = JSON.stringify(
    Object.fromEntries(Object.entries(schemas).map(([k, v]) => [k, T.RuleSet(v)]))
  )
  s.get('/', async (req, rep) => {
    rep.header('Content-Type', 'application/json')
    return ruleSetSpec
  })

  for (const [key, schema] of Object.entries(schemas)) {
    s.register(manageSettings, {
      collection,
      resolve,
      schema: T.RuleSet(schema),
      key: `rules.${key}`,
      allowDelete: true,
      prefix: `/${key}`,
      extractor: (item) => item?.rules?.[key]
    })
  }
}
