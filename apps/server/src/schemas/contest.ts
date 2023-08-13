import { Static, Type } from '@sinclair/typebox'

export const SContestStage = Type.StrictObject({
  name: Type.String(),
  start: Type.Integer(),
  settings: Type.Partial(
    Type.StrictObject({
      registrationEnabled: Type.Boolean(),
      registrationAllowPublic: Type.Boolean(),
      problemEnabled: Type.Boolean(),
      problemShowTags: Type.Boolean(),
      solutionEnabled: Type.Boolean(),
      solutionAllowSubmit: Type.Boolean(),
      solutionShowOther: Type.Boolean(),
      solutionShowOtherDetails: Type.Boolean(),
      solutionShowOtherData: Type.Boolean()
    })
  )
})

export interface IContestStage extends Static<typeof SContestStage> {}

export const SContestProblemSettings = Type.StrictObject({
  score: Type.Number(),
  slug: Type.String(),
  solutionCountLimit: Type.Integer(),
  showAfter: Type.Optional(Type.Integer())
})

export interface IContestProblemSettings extends Static<typeof SContestProblemSettings> {}
