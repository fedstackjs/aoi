import { BSON } from 'mongodb'

import { IApp, IOrgMembership } from '../../db/index.js'
import { defineInjectionPoint } from '../../utils/inject.js'

export const kAppContext = defineInjectionPoint<{
  app: IApp
  capability: BSON.Long
  membership: IOrgMembership
}>('app')
