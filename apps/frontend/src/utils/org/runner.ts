import { denseDateString, prettyMs } from '../time'

export function runnerLastAccessAttrs(accessedAt: number) {
  const now = Date.now()
  const offline = now - accessedAt > 1000 * 60 * 5
  const color = offline ? 'red' : 'green'
  const text = offline ? denseDateString(accessedAt) : prettyMs(now - accessedAt)
  return { text, color }
}
