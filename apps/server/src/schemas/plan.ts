import { T, Static } from './common.js'

export const SPlanContestPrecondition = T.Partial(
  T.StrictObject({
    minTotalScore: T.Number(),
    problems: T.Array(
      T.Object({
        problemId: T.String(),
        minScore: T.Number()
      })
    )
  })
)

export interface IPlanContestPrecondition extends Static<typeof SPlanContestPrecondition> {}

export const SPlanContestSettings = T.StrictObject({
  slug: T.String(),
  preConditionContests: T.Optional(
    T.Array(
      T.Object({
        contestId: T.String(),
        conditions: SPlanContestPrecondition
      })
    )
  )
})

export interface IPlanContestSettings extends Static<typeof SPlanContestSettings> {}

export const SPlanSettings = T.Partial(
  T.StrictObject({
    registrationEnabled: T.Boolean(),
    registrationAllowPublic: T.Boolean(),
    promotion: T.Optional(T.Boolean())
  })
)

export interface IPlanSettings extends Static<typeof SPlanSettings> {}
