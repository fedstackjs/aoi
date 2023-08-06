import { Static, Type } from '@sinclair/typebox'

export const problemConfigSchema = Type.Object({
  label: Type.String(),
  solution: Type.Optional(
    Type.Partial(
      Type.Object(
        {
          maxSize: Type.Integer()
        },
        { description: 'Solution configuration' }
      )
    )
  ),
  judge: Type.Record(Type.String(), Type.Any(), {
    description: 'Judge configuration'
  }),
  submit: Type.Partial(
    Type.Object({
      directUpload: Type.Boolean({ default: false }),
      form: Type.Array(Type.Any())
    })
  )
})

export type ProblemConfig = Static<typeof problemConfigSchema>
