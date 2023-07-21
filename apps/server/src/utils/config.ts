import { logger } from './logger.js'

export function useConfig<T>(key: string): T | undefined
export function useConfig<T>(key: string, defaultValue: T): T
export function useConfig<T>(key: string, defaultValue?: T) {
  try {
    if (!(key in process.env)) return defaultValue
    const value = process.env[key]
    return JSON.parse(value ?? '')
  } catch (e) {
    logger.fatal(`Failed to parse config ${key}: ${e}`)
    throw e
  }
}

export function loadEnv<T, S extends [] | [T]>(
  key: string,
  transform: (value: string) => T,
  ...defaultValue: S
): T {
  if (!(key in process.env)) {
    if (defaultValue.length > 0) {
      return defaultValue[0] as T
    }
    throw new Error(`Missing env ${key}`)
  }
  const value = process.env[key]
  return transform(value ?? '')
}
