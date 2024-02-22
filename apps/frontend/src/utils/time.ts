const units = [
  [1000, 'ms'],
  [60, 's'],
  [60, 'm'],
  [24, 'h'],
  [Infinity, 'd']
] as const
type Unit = (typeof units)[number][1]
export function prettyMs(ms: number, unit: Unit = 's') {
  let result = '',
    skip = true
  for (const [dur, name] of units) {
    skip &&= name !== unit
    if (!skip) result = `${ms % dur}${name}${result}`
    ms = Math.floor(ms / dur)
    if (!ms) break
  }
  return result
}

export function denseDateString(date: Date | number) {
  const actualDate = new Date(date)
  const offset = actualDate.getTimezoneOffset()
  actualDate.setMinutes(actualDate.getMinutes() - offset)
  const [dateStr, timeStr] = actualDate.toISOString().split('T')
  return `${dateStr} ${timeStr.split('.')[0]}`
}
