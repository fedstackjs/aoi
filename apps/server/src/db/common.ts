import { IRuleSet } from '@aoi-js/rule'
import { Static, TSchema } from '@sinclair/typebox'
import { BSON } from 'mongodb'

import { AccessLevel } from '../schemas/index.js'

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
  key: string
  name: string
  description: string
}

export interface IWithAttachment {
  attachments: IAttachment[]
}

export interface IWithAccessLevel {
  accessLevel: AccessLevel
}

export interface IWithContent {
  slug: string
  title: string
  description: string
  tags: string[]
}

export type RulesFromSchemas<T, C extends { [K in keyof T]: unknown }> = {
  [K in keyof T & keyof C]: T[K] extends TSchema ? IRuleSet<C[K], Static<T[K]>> : never
}
