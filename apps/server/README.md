# AOI Server

## Configuration

Configuration is done via environment variables.

| Env variable name | Type     | Default                     | Description            |
| ----------------- | -------- | --------------------------- | ---------------------- |
| `AOI_MONGO_URL`   | `string` | `mongodb://localhost:27017` | MongoDB connection URL |
| `AOI_JWT_SECRET`  | `string` | required                    | JWT Secret             |
| `TRUST_PROXY`     | `any`    | `false`                     | Trust proxy            |
| `LOG_LEVEL`       | `string` | `info`                      | Log level              |
