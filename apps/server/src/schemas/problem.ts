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
    solutionShowOtherData: T.Boolean()
  })
)

export interface IProblemSettings extends Static<typeof SProblemSettings> {}
