import { FastifyPluginAsyncTypebox, Static, TSchema } from '@fastify/type-provider-typebox'
import { FastifyRequest } from 'fastify'
import { BSON, Collection } from 'mongodb'

export const manageSettings: FastifyPluginAsyncTypebox<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: Collection<any>
  resolve: (req: FastifyRequest) => Promise<BSON.UUID | null>
  schema: TSchema
}> = async (s, opts) => {
  const collection = opts.collection as Collection<
    { settings: Static<TSchema> } & { _id: BSON.UUID }
  >

  s.get(
    '/',
    {
      schema: {
        description: 'Get settings',
        response: {
          200: opts.schema
        }
      }
    },
    async (req, rep) => {
      const _id = await opts.resolve(req)
      if (!_id) return rep.notFound()
      const item = await collection.findOne({ _id }, { projection: { settings: 1 } })
      if (!item) return rep.notFound()
      return item.settings
    }
  )

  s.patch(
    '/',
    {
      schema: {
        description: 'Update settings',
        body: opts.schema
      }
    },
    async (req, rep) => {
      const _id = await opts.resolve(req)
      if (!_id) return rep.notFound()
      await collection.updateOne({ _id }, { $set: { settings: req.body } })
      return {}
    }
  )
}
