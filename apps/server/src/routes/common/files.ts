import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { FastifyReply, FastifyRequest } from 'fastify'
import { UUID } from 'mongodb'

import {
  IUrlOptions,
  getDeleteUrl,
  getDownloadUrl,
  getHeadUrl,
  getUploadUrl
} from '../../oss/index.js'
import { T, Static } from '../../schemas/index.js'

const types = Object.freeze({
  upload: getUploadUrl,
  download: getDownloadUrl,
  head: getHeadUrl,
  delete: getDeleteUrl
})

const SGetUrlOptions = T.Partial(
  T.Object({
    expiresIn: T.Integer({ minimum: 1 }),
    size: T.Integer({ minimum: 1 })
  })
)

export const getFileUrl: FastifyPluginAsyncTypebox<{
  allowedTypes?: ('upload' | 'download' | 'head' | 'delete')[]
  resolve: (
    type: string,
    options: Static<typeof SGetUrlOptions>,
    req: FastifyRequest,
    rep: FastifyReply
  ) => Promise<[UUID, string, IUrlOptions?] | string>
}> = async (s, options) => {
  const { orgs } = s.db
  const allowedTypes = options.allowedTypes ?? ['upload', 'download', 'head', 'delete']

  s.get(
    '/:type',
    {
      schema: {
        params: T.Object({
          type: T.StringEnum(allowedTypes)
        }),
        querystring: SGetUrlOptions,
        response: {
          200: T.Object({
            url: T.String()
          })
        }
      }
    },
    async (req, rep) => {
      const resolved = await options.resolve(req.params.type, req.query, req, rep)
      if (typeof resolved === 'string') return { url: resolved }
      const [orgId, key, opt] = resolved
      const org = await orgs.findOne({ _id: orgId }, { projection: { settings: 1 } })
      const settings = org?.settings.oss
      if (!settings) return rep.preconditionFailed('OSS not configured')
      return {
        url: await types[req.params.type](settings, key, opt)
      }
    }
  )
}
