import { Static, Type } from '@sinclair/typebox'

export const SProblemConfigSolutionSchema = Type.Partial(
  Type.Object(
    {
      maxSize: Type.Integer()
    },
    { description: 'Solution configuration' }
  )
)

export type ProblemConfigSolution = Static<typeof SProblemConfigSolutionSchema>

export const SProblemConfigJudgeSchema = Type.Object(
  {
    adapter: Type.String(),
    config: Type.Record(Type.String(), Type.Any())
  },
  {
    description: 'Judge configuration'
  }
)

export type ProblemConfigJudge = Static<typeof SProblemConfigJudgeSchema>

export const SProblemConfigSubmitFormEditorSchema = Type.Object(
  {
    language: Type.String()
  },
  { description: 'Editor configuration' }
)

export type ProblemConfigSubmitFormEditor = Static<typeof SProblemConfigSubmitFormEditorSchema>

export const SProblemConfigSubmitFormMetadataSchema = Type.Object(
  {
    items: Type.Array(
      Type.Object({
        key: Type.String(),
        label: Type.Optional(Type.String()),
        description: Type.Optional(Type.String()),
        type: Type.Partial(
          Type.Object({
            text: Type.Object({}),
            select: Type.Object({
              options: Type.Array(Type.String())
            })
          })
        )
      })
    )
  },
  { description: 'Metadata form configuration' }
)

export type ProblemConfigSubmitFormMetadata = Static<typeof SProblemConfigSubmitFormMetadataSchema>

export const SProblemConfigSubmitFormFileSchema = Type.Object({
  path: Type.String(),
  label: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  type: Type.Partial(
    Type.Object({
      editor: Type.Partial(SProblemConfigSubmitFormEditorSchema),
      metadata: Type.Partial(SProblemConfigSubmitFormMetadataSchema)
    })
  )
})

export type ProblemConfigSubmitFormFile = Static<typeof SProblemConfigSubmitFormFileSchema>

export const SProblemConfigSubmitSchema = Type.Partial(
  Type.Object({
    upload: Type.Boolean({
      description: 'Direct upload solution file'
    }),
    zipFolder: Type.Boolean({
      description: 'Select a folder and submit the compressed zip file'
    }),
    form: Type.Object(
      {
        files: Type.Array(SProblemConfigSubmitFormFileSchema)
      },
      { description: 'Fill in form and generate zip file' }
    )
  })
)

export type ProblemConfigSubmit = Static<typeof SProblemConfigSubmitSchema>

export const SProblemConfigSchema = Type.Object({
  label: Type.String(),
  solution: Type.Optional(SProblemConfigSolutionSchema),
  judge: SProblemConfigJudgeSchema,
  submit: SProblemConfigSubmitSchema
})

export type ProblemConfig = Static<typeof SProblemConfigSchema>
