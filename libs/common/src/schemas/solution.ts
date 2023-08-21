import { type Static, Type } from '@sinclair/typebox'

export const solutionDetailsTestSchema = Type.Object({
  name: Type.String(),
  score: Type.Number(),
  status: Type.String(),
  summary: Type.String()
})

export type SolutionDetailsTest = Static<typeof solutionDetailsTestSchema>

export const solutionDetailsJobSchema = Type.Object({
  name: Type.String(),
  score: Type.Number(),
  scoreScale: Type.Number(),
  status: Type.String(),
  tests: Type.Array(solutionDetailsTestSchema),
  summary: Type.String()
})

export type SolutionDetailsJob = Static<typeof solutionDetailsJobSchema>

export const solutionDetailsSchema = Type.Object({
  jobs: Type.Array(solutionDetailsJobSchema),
  summary: Type.String()
})

export type SolutionDetails = Static<typeof solutionDetailsSchema>
