import { FastifyPluginAsyncTypebox, Static, TSchema, Type } from '@fastify/type-provider-typebox'
import { RouteOptions } from 'fastify'
import { BSON } from 'mongodb'
import { IOrgMembership, orgMemberships } from '../../db/org.js'
import { IPrincipalControlable, IWithAccessLevel } from '../../db/common.js'
import { CAP_NONE, computeCapability } from '../../utils/capability.js'
import { AccessLevel } from '../../schemas/common.js'

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

export function defineRoutes(plugin: FastifyPluginAsyncTypebox) {
  return plugin
}

export function paramSchemaMerger(schema: TSchema) {
  return (route: RouteOptions) => {
    const routeSchema = (route.schema ??= {})
    if (routeSchema.params) {
      routeSchema.params = Type.Intersect([routeSchema.params as TSchema, schema])
    } else {
      routeSchema.params = schema
    }
  }
}

export function swaggerTagMerger(...tags: string[]) {
  return (route: RouteOptions) => {
    const routeSchema = (route.schema ??= {})
    if (!routeSchema.tags) {
      routeSchema.tags = tags
    } else {
      routeSchema.tags = [...routeSchema.tags, ...tags]
    }
  }
}

export function loadUUID(obj: unknown, key: string, err: Error) {
  const uuid = (obj as Record<string, string>)[key]
  if (!BSON.UUID.isValid(uuid)) throw err
  return new BSON.UUID(uuid)
}

export function loadMembership(userId: BSON.UUID, orgId: BSON.UUID) {
  return orgMemberships.findOne({ userId, orgId })
}

export function defaultCapability(
  target: IWithAccessLevel,
  membership: IOrgMembership | null,
  adminMask: BSON.Long,
  capAccess: BSON.Long,
  capAdmin: BSON.Long
) {
  if (!membership) {
    return target.accessLevel === AccessLevel.PUBLIC ? capAccess : CAP_NONE
  }
  if (membership.capability.and(adminMask).equals(adminMask)) {
    return capAdmin
  }
  return target.accessLevel === AccessLevel.PRIVATE ? CAP_NONE : capAccess
}

export function loadCapability(
  target: IPrincipalControlable & IWithAccessLevel,
  membership: IOrgMembership | null,
  adminMask: BSON.Long,
  capAccess: BSON.Long,
  capAdmin: BSON.Long
) {
  return computeCapability(
    target,
    membership,
    defaultCapability(target, membership, adminMask, capAccess, capAdmin)
  )
}
