import { BSON } from 'mongodb'
import { defineInjectionPoint } from '../../utils/inject.js'
import { IOrgMembership } from '../../db/index.js'

export const kOrgContext = defineInjectionPoint<{
  _orgId: BSON.UUID
  // Guest users will have null membership
  _orgMembership: IOrgMembership | null
}>('org')
