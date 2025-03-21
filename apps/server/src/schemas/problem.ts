import { Static, T } from './common.js'

export const SProblemSettings = T.Partial(
  T.Object({
    allowPublicSubmit: T.Boolean(),
    maxSolutionCount: T.Number(),
    // Allow participant see other's solution's status
    solutionShowOther: T.Boolean(),
    // Allow participant see self solution's details (control OSS result json file)
    solutionShowDetails: T.Boolean(),
    // Allow participant see other's solution's details (control OSS result json file)
    solutionShowOtherDetails: T.Boolean(),
    // Allow participant see other's solution's data (control OSS data file)
    solutionShowOtherData: T.Boolean(),

    allowPublicInstance: T.Boolean(),
    maxInstanceCount: T.Number()
  })
)

export interface IProblemSettings extends Static<typeof SProblemSettings> {}

export const SProblemSolutionRuleResult = T.StrictObject({
  showData: T.BooleanOrString()
})

export interface IProblemSolutionRuleResult extends Static<typeof SProblemSolutionRuleResult> {}
