import { Static, Type } from '@sinclair/typebox'

export const problemConfigSchema = Type.Object({
  labels: Type.Array(Type.String(), {
    description: 'Labels for runner selection'
  }),
  runner: Type.Record(Type.String(), Type.Any(), {
    description: 'Runner configuration'
  }),
  submit: Type.Object({
    files: Type.Array(
      Type.Object({
        name: Type.String({
          description: 'The filename of this file in the solution'
        }),
        accept: Type.Optional(
          Type.String({
            description:
              'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept'
          })
        ),
        maxSize: Type.Optional(
          Type.Number({
            description: 'The maximum size of this file in bytes'
          })
        ),
        description: Type.Optional(
          Type.String({
            description: 'The description of this file'
          })
        ),
        showEditor: Type.Boolean({ default: false })
      }),
      { default: [] }
    ),
    showDirectUpload: Type.Boolean({ default: false })
  })
})

export type ProblemConfig = Static<typeof problemConfigSchema>
