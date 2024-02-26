import { BSON } from 'mongodb'
import { defineInjectionPoint } from '../../utils/inject.js'
import { IApp, IOrgMembership } from '../../db/index.js'

export const kAppContext = defineInjectionPoint<{
  app: IApp
  capability: BSON.Long
  membership: IOrgMembership
}>('app')
