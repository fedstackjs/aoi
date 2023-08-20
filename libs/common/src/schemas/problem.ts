import { Static, Type } from '@sinclair/typebox'

export const problemConfigSolutionSchema = Type.Partial(
  Type.Object(
    {
      maxSize: Type.Integer()
    },
    { description: 'Solution configuration' }
  )
)

export type ProblemConfigSolution = Static<typeof problemConfigSolutionSchema>

export const problemConfigJudgeSchema = Type.Record(Type.String(), Type.Any(), {
  description: 'Judge configuration'
})

export type ProblemConfigJudge = Static<typeof problemConfigJudgeSchema>

export const problemConfigSubmitFormEditorSchema = Type.Object(
  {
    language: Type.String()
  },
  { description: 'Editor configuration' }
)

export type ProblemConfigSubmitFormEditor = Static<typeof problemConfigSubmitFormEditorSchema>

export const problemConfigSubmitFormMetadataSchema = Type.Object(
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

export type ProblemConfigSubmitFormMetadata = Static<typeof problemConfigSubmitFormMetadataSchema>

export const problemConfigSubmitFormFileSchema = Type.Object({
  path: Type.String(),
  label: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  type: Type.Partial(
    Type.Object({
      editor: Type.Partial(problemConfigSubmitFormEditorSchema),
      metadata: Type.Partial(problemConfigSubmitFormMetadataSchema)
    })
  )
})

export type ProblemConfigSubmitFormFile = Static<typeof problemConfigSubmitFormFileSchema>

export const problemConfigSubmitSchema = Type.Partial(
  Type.Object({
    upload: Type.Boolean({
      description: 'Direct upload solution file'
    }),
    zipFolder: Type.Boolean({
      description: 'Select a folder and submit the compressed zip file'
    }),
    form: Type.Object(
      {
        files: Type.Array(problemConfigSubmitFormFileSchema)
      },
      { description: 'Fill in form and generate zip file' }
    )
  })
)

export type ProblemConfigSubmit = Static<typeof problemConfigSubmitSchema>

export const problemConfigSchema = Type.Object({
  label: Type.String(),
  solution: Type.Optional(problemConfigSolutionSchema),
  judge: problemConfigJudgeSchema,
  submit: problemConfigSubmitSchema
})

export type ProblemConfig = Static<typeof problemConfigSchema>
