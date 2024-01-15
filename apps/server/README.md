# AOI Server

## Configuration

Configuration is done via environment variables.

| Env variable name              | Type      | Default                           | Description                           |
| ------------------------------ | --------- | --------------------------------- | ------------------------------------- |
| `AOI_MONGO_URL`                | `string`  | `mongodb://localhost:27017`       | MongoDB connection URL                |
| `AOI_JWT_SECRET`               | `string`  | required                          | JWT Secret                            |
| `TRUST_PROXY`                  | `any`     | `false`                           | Trust proxy                           |
| `LOG_LEVEL`                    | `string`  | `info`                            | Log level                             |
| `SIGNUP_ENABLED`               | `boolean` | `true`                            | Enable signup                         |
| `AUTH_PROVIDERS`               | `string`  | `password`                        | Comma-separated string of providers   |
| `MAIL_OPTIONS`                 | `json`    | required if enabled               | See `nodemailer` docs                 |
| `MAIL_FROM`                    | `string`  | `"AOI System" <aoi@fedstack.org>` | Mail from                             |
| `MAIL_HTML`                    | `string`  | `<omitted>`                       | See source code for details           |
| `MAIL_ALLOW_SIGNUP_FROM_LOGIN` | `boolean` | `false`                           | Auto signup for unmatched email login |
| `MAIL_WHITELIST`               | `json`    | `null`                            | See source code for details           |
