import { FastifyPluginAsyncTypebox, Static, Type } from '@fastify/type-provider-typebox'
import { FastifyReply, FastifyRequest } from 'fastify'
import {
  IUrlOptions,
  getDeleteUrl,
  getDownloadUrl,
  getHeadUrl,
  getUploadUrl
} from '../../oss/index.js'
import { UUID } from 'mongodb'

const types = Object.freeze({
  upload: getUploadUrl,
  download: getDownloadUrl,
  head: getHeadUrl,
  delete: getDeleteUrl
})

const SGetUrlOptions = Type.Partial(
  Type.Object({
    expiresIn: Type.Integer({ minimum: 1 }),
    size: Type.Integer({ minimum: 1 })
  })
)

export const getFileUrl: FastifyPluginAsyncTypebox<{
  allowedTypes?: ('upload' | 'download' | 'head' | 'delete')[]
  resolve: (
    type: string,
    options: Static<typeof SGetUrlOptions>,
    req: FastifyRequest,
    rep: FastifyReply
  ) => Promise<[UUID, string, IUrlOptions?]>
}> = async (s, options) => {
  const { orgs } = s.db
  const allowedTypes = options.allowedTypes ?? ['upload', 'download', 'head', 'delete']

  s.get(
    '/:type',
    {
      schema: {
        params: Type.Object({
          type: Type.StringEnum(allowedTypes)
        }),
        querystring: SGetUrlOptions,
        response: {
          200: Type.Object({
            url: Type.String()
          })
        }
      }
    },
    async (req, rep) => {
      const [orgId, key, opt] = await options.resolve(req.params.type, req.query, req, rep)
      const org = await orgs.findOne({ _id: orgId }, { projection: { settings: 1 } })
      const settings = org?.settings.oss
      if (!settings) return rep.preconditionFailed('OSS not configured')
      return {
        url: await types[req.params.type](settings, key, opt)
      }
    }
  )
}
