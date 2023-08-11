import { Static, Type } from '@sinclair/typebox'

export const SProblemSettings = Type.Partial(
  Type.Object({
    allowPublicSubmit: Type.Boolean(),
    maxSolutionCount: Type.Number()
  })
)

export interface IProblemSettings extends Static<typeof SProblemSettings> {}
