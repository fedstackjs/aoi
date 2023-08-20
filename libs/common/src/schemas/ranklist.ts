import { Static, Type } from '@sinclair/typebox'

export const ranklistTopstarSchema = Type.Object({
  list: Type.Array(
    Type.Object({
      userId: Type.String(),
      mutations: Type.Array(
        Type.Object({
          score: Type.Number(),
          ts: Type.Integer()
        })
      )
    })
  )
})

export type RanklistTopstar = Static<typeof ranklistTopstarSchema>

export const ranklistParticipantSchema = Type.Object({
  columns: Type.Array(
    Type.Object({
      name: Type.String(),
      description: Type.String()
    })
  ),
  list: Type.Array(
    Type.Object({
      rank: Type.Integer(),
      userId: Type.String(),
      columns: Type.Array(
        Type.Object({
          content: Type.String()
        })
      )
    })
  )
})

export type RanklistParticipant = Static<typeof ranklistParticipantSchema>

export const ranklistMetadataSchema = Type.Partial(
  Type.Object({
    generatedAt: Type.Integer(),
    description: Type.String()
  })
)

export type RanklistMetadata = Static<typeof ranklistMetadataSchema>

export const ranklistSchema = Type.Object({
  topstar: Type.Optional(ranklistTopstarSchema),
  participant: ranklistParticipantSchema,
  metadata: ranklistMetadataSchema
})

export type Ranklist = Static<typeof ranklistSchema>
