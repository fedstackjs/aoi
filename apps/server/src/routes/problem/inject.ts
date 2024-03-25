import { BSON } from 'mongodb'

import { IProblem } from '../../index.js'
import { defineInjectionPoint } from '../../utils/inject.js'

export const kProblemContext = defineInjectionPoint<{
  _problemId: BSON.UUID
  _problemCapability: BSON.Long
  _problem: IProblem
}>('problem')
