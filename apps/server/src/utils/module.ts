import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export function tryResolve(mod: string) {
  try {
    return require.resolve(mod)
  } catch {
    return null
  }
}

export function hasModule(mod: string) {
  return tryResolve(mod) !== null
}
