import { computed, ref, type Ref } from 'vue'

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

function toDateTimeLocalString(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  const localDate = new Date(date.getTime() - offset)
  return localDate.toISOString().slice(0, 16)
}

export function useDateTimeTextField(value: Ref<number>) {
  const error = ref('')
  const model = computed({
    get: () => toDateTimeLocalString(new Date(value.value ?? 0)),
    set: (val) => {
      const date = +new Date(val)
      if (Number.isNaN(date)) {
        error.value = 'Invalid date'
      } else {
        value.value = date
        error.value = ''
      }
    }
  })
  return { model, error }
}

export function useDateTimeStrTextField(value: Ref<string>) {
  const error = ref('')
  const model = computed({
    get: () => value.value && toDateTimeLocalString(new Date(+(value.value ?? 0))),
    set: (val) => {
      if (val) {
        const date = +new Date(val)
        if (Number.isNaN(date)) {
          error.value = 'Invalid date'
        } else {
          value.value = '' + date
          error.value = ''
        }
      } else {
        value.value = ''
        error.value = ''
      }
    }
  })
  return { model, error }
}
