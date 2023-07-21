import { FastifyPluginAsyncTypebox, Static, Type } from '@fastify/type-provider-typebox'
import { StringEnum } from '../../utils/types.js'
import { getOSSUrl } from '../../oss/index.js'

export const paginationSchema = Type.Object({
  page: Type.Integer({ minimum: 1, default: 1 }),
  pageSize: Type.Integer({ minimum: 1, maximum: 100, default: 10 })
})

export function paginationToOptions(pagination: Static<typeof paginationSchema>) {
  return {
    skip: (pagination.page - 1) * pagination.pageSize,
    limit: pagination.pageSize
  }
}

export const getUrlSchema = Type.Object({
  type: StringEnum(['upload', 'download', 'delete', 'head']),
  sha256: Type.Optional(Type.String()),
  size: Type.Optional(Type.Integer({ minimum: 0 }))
})

export function getUrl<E extends Error>(
  query: Static<typeof getUrlSchema>,
  key: string,
  err: E,
  expiresIn = 60
) {
  const { type, ...options } = query
  if (type === 'upload' && !(options.sha256 && options.size)) {
    throw err
  }
  return getOSSUrl(type, key, { ...options, expiresIn })
}

export function defineRoutes(plugin: FastifyPluginAsyncTypebox) {
  return plugin
}
