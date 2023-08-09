import { Static, Type } from '@sinclair/typebox'
import { StrictObject } from './common.js'

export const SContestStage = StrictObject({
  name: Type.String(),
  start: Type.Integer(),
  settings: Type.Partial(
    StrictObject({
      registrationEnabled: Type.Boolean(),
      registrationAllowPublic: Type.Boolean(),
      problemEnabled: Type.Boolean(),
      problemShowTags: Type.Boolean(),
      submitEnabled: Type.Boolean(),
      solutionAllowOther: Type.Boolean(),
      solutionAllowOtherDetails: Type.Boolean(),
      solutionAllowOtherDownload: Type.Boolean()
    })
  )
})

export interface IContestStage extends Static<typeof SContestStage> {}

export const SContestProblemSettings = StrictObject({
  score: Type.Number(),
  slug: Type.String(),
  solutionCountLimit: Type.Integer(),
  showAfter: Type.Optional(Type.Integer())
})

export interface IContestProblemSettings extends Static<typeof SContestProblemSettings> {}
