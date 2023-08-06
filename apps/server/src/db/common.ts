import { BSON } from 'mongodb'
import { AccessLevel } from '../schemas/common.js'

/**
 * The following interfaces describes the datastructure
 * related to the principal controlable objects.
 *
 * A principal controlable object is an object that has
 * a access control list (ACL) that is based on the
 * principal's UUID and the principal's capability.
 *
 * A principal is either a user or a group.
 *
 * When processing a request, the server should grab the
 * object from database, and use the ACL to determine
 * whether the principal has the capability to perform
 * the action.
 */

export interface IPrincipalAssociation {
  /**
   * The principal's UUID (userId or groupId)
   */
  principalId: BSON.UUID
  /**
   * The principal's capability
   */
  capability: BSON.Long
}

export interface IPrincipalControlable {
  /**
   * The ACL
   */
  associations: IPrincipalAssociation[]
}

export interface IAttachment {
  name: string
  description: string
}

export interface IWithAttachment {
  attachments: Record<string, IAttachment>
}

export interface IWithAccessLevel {
  accessLevel: AccessLevel
}
