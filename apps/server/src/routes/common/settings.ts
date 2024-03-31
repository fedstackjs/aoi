import { FastifyPluginAsyncTypebox, TSchema } from '@fastify/type-provider-typebox'
import { FastifyRequest } from 'fastify'
import { BSON, Collection } from 'mongodb'

export const manageSettings: FastifyPluginAsyncTypebox<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: Collection<any>
  resolve: (req: FastifyRequest) => Promise<BSON.UUID | null>
  schema: TSchema
  key?: string
  allowDelete?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractor?: (item: any) => any
}> = async (s, opts) => {
  const {
    collection,
    resolve,
    schema,
    key = 'settings',
    allowDelete = false,
    extractor = (item) => item?.[key]
  } = opts as Omit<typeof opts, 'collection'> & {
    collection: Collection<{ _id: BSON.UUID } & Record<string, unknown>>
  }

  s.get(
    '/',
    {
      schema: {
        description: `Get ${key}`,
        response: {
          200: schema
        }
      }
    },
    async (req, rep) => {
      const _id = await resolve(req)
      if (!_id) return rep.notFound()
      const item = await collection.findOne({ _id }, { projection: { [key]: 1 } })
      const settings = extractor(item)
      if (!settings) return rep.notFound()
      return settings
    }
  )

  s.patch(
    '/',
    {
      schema: {
        description: `Update ${key}`,
        body: schema
      }
    },
    async (req, rep) => {
      const _id = await resolve(req)
      if (!_id) return rep.notFound()
      await collection.updateOne({ _id }, { $set: { [key]: req.body } })
      return {}
    }
  )

  if (allowDelete) {
    s.delete(
      '/',
      {
        schema: {
          description: `Delete ${key}`
        }
      },
      async (req, rep) => {
        const _id = await resolve(req)
        if (!_id) return rep.notFound()
        await collection.updateOne({ _id }, { $unset: { [key]: '' } })
        return {}
      }
    )
  }
}
