import { T, Static } from './common.js'

export const SContestAction = T.StrictObject({
  type: T.StringEnum(['link', 'toast']),
  icon: T.String({ maxLength: 1024 }),
  title: T.String({ maxLength: 16 }),
  target: T.String({ maxLength: 1024 })
})

export interface IContestAction extends Static<typeof SContestAction> {}

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
      // Allow participant to create solutions
      problemAllowCreateSolution: T.Boolean(),
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

      // Instance
      // Enable instance function to participants
      instanceEnabled: T.Boolean(),
      // Allow participant to create instances
      instanceAllowCreate: T.Boolean(),
      // Max instance count
      instanceLimit: T.Integer(),

      // Enable function function to participants
      ranklistEnabled: T.Boolean(),
      // Skip ranklist calculation
      ranklistSkipCalculation: T.Boolean(),
      // Show participants panel
      participantEnabled: T.Boolean(),
      // Participant tag rules
      tagRules: T.Partial(
        T.StrictObject({
          copyVerifiedFields: T.String()
        })
      ),
      // Actions
      actions: T.Array(SContestAction),
      // Force Running
      forceRunning: T.Boolean()
    })
  )
})

export interface IContestStage extends Static<typeof SContestStage> {}

export const SContestProblemSettings = T.StrictObject({
  score: T.Number(),
  slug: T.String(),
  solutionCountLimit: T.Integer(),
  showAfter: T.Optional(T.Integer()),
  actions: T.Optional(T.Array(SContestAction)),
  disableCreateSolution: T.Optional(T.Boolean()),
  disableCreateInstance: T.Optional(T.Boolean()),
  maxInstanceCount: T.Optional(T.Integer()),
  disableSubmit: T.Optional(T.Boolean())
})

export interface IContestProblemSettings extends Static<typeof SContestProblemSettings> {}

export const SContestRanklistSettings = T.StrictObject({
  showAfter: T.Optional(T.Integer()),
  showBefore: T.Optional(T.Integer()),
  config: T.Optional(T.String())
})

export interface IContestRanklistSettings extends Static<typeof SContestRanklistSettings> {}

export const SContestSolutionRuleResult = T.StrictObject({
  showData: T.BooleanOrString()
})

export interface IContestSolutionRuleResult extends Static<typeof SContestSolutionRuleResult> {}

export const SContestParticipantRuleResult = T.StrictObject({
  allowRegister: T.BooleanOrString(),
  tags: T.Array(T.String())
})

export interface IContestParticipantRuleResult
  extends Static<typeof SContestParticipantRuleResult> {}
