import { Static, Type } from '@sinclair/typebox'

export const SAppSettings = Type.Partial(
  Type.Object({
    allowPublicLogin: Type.Boolean(),
    requireMfa: Type.Boolean(),
    scopes: Type.Array(
      Type.String({
        pattern: '^[^.].+$'
      })
    )
  })
)

export interface IAppSettings extends Static<typeof SAppSettings> {}
