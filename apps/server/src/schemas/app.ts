import { Static, Type } from '@sinclair/typebox'

export const SAppSettings = Type.Partial(
  Type.Object({
    allowPublicLogin: Type.Boolean(),
    requireMfa: Type.Boolean(),
    scopes: Type.Array(
      Type.String({
        pattern: '^[^.].?$'
      })
    ),
    redirectUris: Type.Array(
      Type.Object({
        uri: Type.String(),
        label: Type.String()
      })
    )
  })
)

export interface IAppSettings extends Static<typeof SAppSettings> {}
