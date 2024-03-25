import { BSON } from 'mongodb'

import { IPlan, IPlanParticipant } from '../../index.js'
import { defineInjectionPoint } from '../../utils/inject.js'

export const kPlanContext = defineInjectionPoint<{
  _plan: IPlan
  _planCapability: BSON.Long
  _planParticipant: IPlanParticipant | null
}>('plan')
