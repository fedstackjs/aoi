import { FastifyPluginAsyncTypebox, Static, Type } from '@fastify/type-provider-typebox'
import { StringEnum } from '../../schemas/common.js'
import { FastifyReply, FastifyRequest } from 'fastify'
import { IOrgOssSettings } from '../../schemas/org.js'
import {
  IUrlOptions,
  getDeleteUrl,
  getDownloadUrl,
  getHeadUrl,
  getUploadUrl
} from '../../oss/index.js'
import { BSON } from 'mongodb'
import { orgs } from '../../db/org.js'

const types = Object.freeze({
  upload: getUploadUrl,
  download: getDownloadUrl,
  head: getHeadUrl,
  delete: getDeleteUrl
})

const SGetUrlOptions = Type.Partial(
  Type.Object({
    expiresIn: Type.Integer({ minimum: 1 }),
    sha256: Type.String(),
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
  ) => Promise<[IOrgOssSettings | undefined, string, IUrlOptions?]>
}> = async (s, options) => {
  const allowedTypes = options.allowedTypes ?? ['upload', 'download', 'head', 'delete']
  s.get(
    '/:type',
    {
      schema: {
        params: Type.Object({
          type: StringEnum(allowedTypes)
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
      const [settings, key, opt] = await options.resolve(req.params.type, req.query, req, rep)
      if (!settings) return rep.preconditionFailed('OSS not configured')
      return {
        url: await types[req.params.type](settings, key, opt)
      }
    }
  )
}

export async function loadOrgOssSettings(orgId: BSON.UUID) {
  const org = await orgs.findOne({ _id: orgId }, { projection: { settings: 1 } })
  return org?.settings.oss
}