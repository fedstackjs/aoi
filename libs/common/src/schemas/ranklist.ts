import { Static, Type } from '@sinclair/typebox'

export const SRanklistTopstarSchema = Type.Object({
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

export type RanklistTopstar = Static<typeof SRanklistTopstarSchema>

export const SRanklistParticipantSchema = Type.Object({
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
      tags: Type.Optional(Type.Array(Type.String())),
      columns: Type.Array(
        Type.Object({
          content: Type.String()
        })
      )
    })
  )
})

export type RanklistParticipant = Static<typeof SRanklistParticipantSchema>

export const SRanklistMetadataSchema = Type.Partial(
  Type.Object({
    generatedAt: Type.Integer(),
    description: Type.String()
  })
)

export type RanklistMetadata = Static<typeof SRanklistMetadataSchema>

export const SRanklistSchema = Type.Object({
  topstar: Type.Optional(SRanklistTopstarSchema),
  participant: SRanklistParticipantSchema,
  metadata: SRanklistMetadataSchema
})

export type Ranklist = Static<typeof SRanklistSchema>
