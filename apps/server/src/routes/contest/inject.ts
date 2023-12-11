import { BSON } from 'mongodb'
import { IContest, IContestStage, IContestParticipant } from '../../index.js'
import { defineInjectionPoint } from '../../utils/inject.js'

export const kContestContext = defineInjectionPoint<{
  _contestId: BSON.UUID
  _contest: IContest
  _contestCapability: BSON.Long
  _contestStage: IContestStage
  _contestParticipant: IContestParticipant | null
}>('contest')
