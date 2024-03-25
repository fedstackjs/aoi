import { T, Static } from './common.js'

export const SAppSettings = T.Partial(
  T.Object({
    allowPublicLogin: T.Boolean(),
    requireMfa: T.Boolean(),
    scopes: T.Array(
      T.String({
        pattern: '^[^.].?$'
      })
    ),
    redirectUris: T.Array(
      T.Object({
        uri: T.String(),
        label: T.String()
      })
    ),
    attachUser: T.Boolean(),
    attachMembership: T.Boolean(),
    allowDeviceFlow: T.Boolean()
  })
)

export interface IAppSettings extends Static<typeof SAppSettings> {}
