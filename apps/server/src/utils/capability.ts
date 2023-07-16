import { BSON } from 'mongodb'
import { IPrincipalControlable } from '../db/common.js'
import { IOrgMembership } from '../db/org.js'

/**
 * return a mask that is `1 << n` in Long
 *
 * @param n
 */
export function capabilityMask(n: number) {
  return BSON.Long.fromInt(1).shl(n)
}

export function computeCapability(object: IPrincipalControlable, membership: IOrgMembership) {
  return object.associations.reduce(
    (acc, { principalId, capability }) =>
      principalId.equals(membership.userId) ||
      membership.groups.some(({ groupId }) => groupId.equals(principalId))
        ? acc.or(capability)
        : acc,
    BSON.Long.ZERO
  )
}

export function hasCapability(capability: BSON.Long, mask: BSON.Long) {
  return capability.and(mask).equals(mask)
}
