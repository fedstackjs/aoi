import { BSON } from 'mongodb'
import { db } from './client.js'
import { IPrincipalControlable } from './common.js'
import { capabilityMask } from '../utils/capability.js'

export enum ProblemAccessLevel {
  /**
   * Public problems are visible to everyone
   */
  PUBLIC = 0,
  /**
   * Restricted problems are visible to members of the organization
   */
  RESTRICED = 1,
  /**
   * Private problems are visible to principals associated
   */
  PRIVATE = 2
}

export const ProblemCapability = {
  CAP_ACCESS: capabilityMask(0),
  CAP_CONTENT: capabilityMask(1),
  CAP_DATA: capabilityMask(2),
  CAP_ADMIN: capabilityMask(3)
}

export interface IProblemAttachment {
  /**
   * Attachment's download name
   */
  name: string
  /**
   * Attachment's description
   */
  description: string
}

export interface IProblemData {
  createdAt: number
  config: string
  description: string
}

export interface IProblem extends IPrincipalControlable {
  _id: BSON.UUID
  orgId: BSON.UUID

  accessLevel: ProblemAccessLevel
  slug: string
  title: string
  description: string
  tags: string[]

  /**
   * Attachment map: key -> attachment
   * Stored in S3 <problemId>/attachments/<key>
   */
  attachments: Record<string, IProblemAttachment>
  /**
   * Data map: hash -> data
   * Stored in S3 <problemId>/data/<hash>
   */
  data: Record<string, IProblemData>
  currentDataHash: string

  createdAt: number
  updatedAt: number
}

export const problems = db.collection<IProblem>('problems')
await problems.createIndex({ slug: 1 }, { unique: true })
await problems.createIndex({ [`associations.principalId`]: 1 })
