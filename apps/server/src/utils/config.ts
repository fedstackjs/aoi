export const ENV_PREFIX = process.env.AOI_ENV_PREFIX ?? 'AOI_'

export function loadEnv<T, S extends [] | [T]>(
  key: string,
  transform: (value: string) => T,
  ...defaultValue: S
): T {
  key = ENV_PREFIX + key
  if (!(key in process.env)) {
    if (defaultValue.length > 0) {
      return defaultValue[0] as T
    }
    throw new Error(`Missing env ${key}`)
  }
  const value = process.env[key]
  return transform(value ?? '')
}

export const parseBoolean = (value: string) => !!JSON.parse(value)
