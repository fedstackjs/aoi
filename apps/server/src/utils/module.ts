import { createRequire } from 'node:module'
import { join } from 'node:path'

const require = createRequire(import.meta.url)

export function tryResolve(mod: string) {
  try {
    return require.resolve(mod)
  } catch {
    return null
  }
}

function resolveFrontendPath() {
  const frontendPackage = tryResolve('@aoi-js/frontend/package.json')
  if (!frontendPackage) return ''
  return join(frontendPackage, '..', 'dist')
}

export const frontendPath = resolveFrontendPath()
