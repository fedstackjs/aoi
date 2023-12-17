import { Static, Type } from '@sinclair/typebox'

export const SContestStage = Type.StrictObject({
  name: Type.String(),
  start: Type.Integer(),
  settings: Type.Partial(
    Type.StrictObject({
      // Enable registration function to participants
      registrationEnabled: Type.Boolean(),
      // If enabled, user must have CAP_REGISTRATION to register
      registrationAllowPublic: Type.Boolean(),
      // Enable problem function to participants
      problemEnabled: Type.Boolean(),
      // Show problem tags to participants
      problemShowTags: Type.Boolean(),
      // Show solutions to participants
      solutionEnabled: Type.Boolean(),
      // Allow submit new solutions
      solutionAllowSubmit: Type.Boolean(),
      // Allow participant see other's solution's status
      solutionShowOther: Type.Boolean(),
      // Allow participant see self solution's details (control OSS result json file)
      solutionShowDetails: Type.Boolean(),
      // Allow participant see other's solution's details (control OSS result json file)
      solutionShowOtherDetails: Type.Boolean(),
      // Allow participant see other's solution's data (control OSS data file)
      solutionShowOtherData: Type.Boolean(),
      // Enable function function to participants
      ranklistEnabled: Type.Boolean(),
      // Show participants panel
      participantEnabled: Type.Boolean()
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

export const SContestRanklistSettings = Type.StrictObject({
  showAfter: Type.Optional(Type.Integer()),
  showBefore: Type.Optional(Type.Integer())
})

export interface IContestRanklistSettings extends Static<typeof SContestRanklistSettings> {}
