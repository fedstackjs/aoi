import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { BSON, Collection } from 'mongodb'
import { IPrincipalControlable, TypeUUID, groups, users } from '../../index.js'
import { FastifyRequest } from 'fastify'

const Params = Type.Object({
  principalId: Type.String()
})

export const manageACL: FastifyPluginAsyncTypebox<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: Collection<any>
  resolve: (req: FastifyRequest) => Promise<BSON.UUID>
  defaultCapability: BSON.Long
}> = async (s, opts) => {
  const resolve = opts.resolve
  const collection = opts.collection as Collection<IPrincipalControlable & { _id: BSON.UUID }>
  s.get(
    '/',
    {
      schema: {
        description: 'Get associations of the object',
        response: {
          200: Type.Array(
            Type.Object({
              principalId: TypeUUID(),
              capability: Type.String()
            })
          )
        }
      }
    },
    async (req, rep) => {
      const _id = await resolve(req)
      const obj = await collection.findOne({ _id }, { projection: { associations: 1 } })
      if (!obj) return rep.notFound()
      return obj.associations.map((item) => ({ ...item, capability: item.capability.toString() }))
    }
  )

  s.post(
    '/',
    {
      schema: {
        body: Type.Object({
          principalId: Type.String()
        })
      }
    },
    async (req, rep) => {
      const principalId = new BSON.UUID(req.body.principalId)
      let exists = await users.countDocuments({ _id: principalId })
      exists ||= await groups.countDocuments({ _id: principalId })
      if (!exists) return rep.notFound()

      const _id = await resolve(req)
      const { modifiedCount } = await collection.updateOne(
        { _id, 'associations.principalId': { $ne: principalId } },
        { $push: { associations: { principalId, capability: opts.defaultCapability } } }
      )
      if (!modifiedCount) return rep.conflict()
      return {}
    }
  )

  s.patch(
    '/:principalId',
    {
      schema: {
        params: Params,
        body: Type.Object({
          capability: Type.String()
        })
      }
    },
    async (req, rep) => {
      const principalId = new BSON.UUID(req.params.principalId)
      const _id = await resolve(req)
      const { matchedCount } = await collection.updateOne(
        { _id, 'associations.principalId': principalId },
        { $set: { 'associations.$.capability': new BSON.Long(req.body.capability) } }
      )
      if (!matchedCount) return rep.notFound()
      return {}
    }
  )

  s.delete(
    '/:principalId',
    {
      schema: {
        params: Params
      }
    },
    async (req, rep) => {
      const principalId = new BSON.UUID(req.params.principalId)
      const _id = await resolve(req)
      const { modifiedCount } = await collection.updateOne(
        { _id },
        { $pull: { associations: { principalId } } }
      )
      if (!modifiedCount) return rep.notFound()
      return {}
    }
  )
}
