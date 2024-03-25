import { T, Static } from './common.js'

export const SContestStage = T.StrictObject({
  name: T.String(),
  start: T.Integer(),
  settings: T.Partial(
    T.StrictObject({
      // Enable registration function to participants
      registrationEnabled: T.Boolean(),
      // If enabled, user must have CAP_REGISTRATION to register
      registrationAllowPublic: T.Boolean(),
      // Enable problem function to participants
      problemEnabled: T.Boolean(),
      // Show problem tags to participants
      problemShowTags: T.Boolean(),
      // Show solutions to participants
      solutionEnabled: T.Boolean(),
      // Allow submit new solutions
      solutionAllowSubmit: T.Boolean(),
      // Allow participant see other's solution's status
      solutionShowOther: T.Boolean(),
      // Allow participant see self solution's details (control OSS result json file)
      solutionShowDetails: T.Boolean(),
      // Allow participant see other's solution's details (control OSS result json file)
      solutionShowOtherDetails: T.Boolean(),
      // Allow participant see other's solution's data (control OSS data file)
      solutionShowOtherData: T.Boolean(),
      // Enable function function to participants
      ranklistEnabled: T.Boolean(),
      // Show participants panel
      participantEnabled: T.Boolean(),
      // Participant tag rules
      tagRules: T.Optional(
        T.Partial(
          T.StrictObject({
            copyVerifiedFields: T.String()
          })
        )
      )
    })
  )
})

export interface IContestStage extends Static<typeof SContestStage> {}

export const SContestProblemSettings = T.StrictObject({
  score: T.Number(),
  slug: T.String(),
  solutionCountLimit: T.Integer(),
  showAfter: T.Optional(T.Integer())
})

export interface IContestProblemSettings extends Static<typeof SContestProblemSettings> {}

export const SContestRanklistSettings = T.StrictObject({
  showAfter: T.Optional(T.Integer()),
  showBefore: T.Optional(T.Integer()),
  config: T.Optional(T.String())
})

export interface IContestRanklistSettings extends Static<typeof SContestRanklistSettings> {}
