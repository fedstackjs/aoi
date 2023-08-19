import { Static, Type } from '@sinclair/typebox'

export const SPlanContestSettings = Type.Partial(
  Type.StrictObject({
    preConditionContests: Type.Array(
      Type.Object({
        contestId: Type.String()
      })
    )
  })
)

export interface IPlanContestSettings extends Static<typeof SPlanContestSettings> {}
