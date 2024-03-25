import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { FastifyRequest } from 'fastify'
import { BSON, Collection } from 'mongodb'

import { IWithContent } from '../../db/index.js'
import { T } from '../../schemas/index.js'

export const manageContent: FastifyPluginAsyncTypebox<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: Collection<any>
  resolve: (req: FastifyRequest) => Promise<BSON.UUID | null>
}> = async (s, opts) => {
  const collection = opts.collection as Collection<IWithContent & { _id: BSON.UUID }>
  s.patch(
    '/',
    {
      schema: {
        description: 'Update problem content',
        body: T.Partial(
          T.StrictObject({
            title: T.String(),
            slug: T.String(),
            description: T.String(),
            tags: T.Array(T.String())
          })
        ),
        response: {
          200: T.Object({})
        }
      }
    },
    async (req, rep) => {
      const _id = await opts.resolve(req)
      if (!_id) return rep.notFound()
      await collection.updateOne({ _id }, { $set: req.body })
      return {}
    }
  )
}
