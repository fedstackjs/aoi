import { HTTPError } from 'ky'
import { http } from './http'

async function findNext(current: number, check: (n: number) => Promise<boolean>) {
  let step = 1
  while (await check(current + step)) {
    step *= 2
  }
  let left = current + step / 2
  let right = current + step
  let result = right
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (await check(mid)) {
      left = mid + 1
    } else {
      result = mid
      right = mid - 1
    }
  }
  return result
}

export async function findNextSlug(type: string, orgId: string, formatter: (n: number) => string) {
  const key = `aoi-next-slug-${type}-${orgId}`
  const current = parseInt(localStorage.getItem(key) || '0', 10)
  const next = await findNext(current, async (n) => {
    try {
      await http.post(`public/resolve-slug`, {
        json: { orgId, type, slug: formatter(n) }
      })
      return true
    } catch (err) {
      if (err instanceof HTTPError && err.response.status === 404) {
        return false
      }
      throw err
    }
  })
  localStorage.setItem(key, next.toString())
  return formatter(next)
}
