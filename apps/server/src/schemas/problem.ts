import { Static, Type } from '@sinclair/typebox'

export const SProblemSettings = Type.Partial(
  Type.Object({
    allowPublicSubmit: Type.Boolean(),
    maxSolutionCount: Type.Number(),
    // Allow participant see other's solution's status
    solutionShowOther: Type.Boolean(),
    // Allow participant see self solution's details (control OSS result json file)
    solutionShowDetails: Type.Boolean(),
    // Allow participant see other's solution's details (control OSS result json file)
    solutionShowOtherDetails: Type.Boolean(),
    // Allow participant see other's solution's data (control OSS data file)
    solutionShowOtherData: Type.Boolean()
  })
)

export interface IProblemSettings extends Static<typeof SProblemSettings> {}
