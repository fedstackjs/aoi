import { BSON } from 'mongodb'
import { IPrincipalControlable, IOrgMembership } from '../db/index.js'

/**
 * See:
 * https://stackoverflow.com/questions/75000363/how-to-prevent-mongodb-nodejs-driver-converts-long-into-number
 */

export const CAP_ALL = BSON.Long.MAX_UNSIGNED_VALUE
export const CAP_NONE = BSON.Long.UZERO

/**
 * return a mask that is `1 << n` in Long
 *
 * @param n
 */
export function capabilityMask(n: number) {
  return BSON.Long.fromInt(1, true).shl(n)
}

export function computeCapability(
  object: IPrincipalControlable,
  membership: IOrgMembership | null,
  defaultCapability = CAP_NONE
) {
  if (!membership) return defaultCapability
  return object.associations.reduce(
    (acc, { principalId, capability }) =>
      principalId.equals(membership.userId) ||
      membership.groups.some((groupId) => groupId.equals(principalId))
        ? acc.or(capability)
        : acc,
    defaultCapability
  )
}

export function hasCapability(capability: BSON.Long, mask: BSON.Long) {
  return capability.and(mask).equals(mask)
}

export function ensureCapability<E extends Error>(capability: BSON.Long, mask: BSON.Long, err: E) {
  if (!hasCapability(capability, mask)) {
    throw err
  }
}
