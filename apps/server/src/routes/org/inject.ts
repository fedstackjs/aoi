import { BSON } from 'mongodb'

import { IOrgMembership } from '../../db/index.js'
import { defineInjectionPoint } from '../../utils/inject.js'

export const kOrgContext = defineInjectionPoint<{
  _orgId: BSON.UUID
  // Guest users will have null membership
  _orgMembership: IOrgMembership | null
}>('org')
