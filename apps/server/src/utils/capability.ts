import { BSON } from 'mongodb'
import { IPrincipalControlable } from '../db/common.js'
import { IOrgMembership } from '../db/org.js'

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
  defaultCapability = BSON.Long.ZERO
) {
  if (!membership) return defaultCapability
  if (membership.userId.equals(object.ownerId)) return BSON.Long.MAX_UNSIGNED_VALUE
  return object.associations.reduce(
    (acc, { principalId, capability }) =>
      principalId.equals(membership.userId) ||
      membership.groups.some(({ groupId }) => groupId.equals(principalId))
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
