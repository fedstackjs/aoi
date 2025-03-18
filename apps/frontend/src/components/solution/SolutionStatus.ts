import { computed } from 'vue'

export interface ISolutionStatusProps {
  status?: string
  to?: string
  abbrev?: boolean
  score?: number
}

export function useSolutionStatus(props: ISolutionStatusProps) {
  const knownStatus: Record<string, [string, string]> = {
    Accepted: ['mdi-check', 'success'],
    Success: ['mdi-check', 'info'],
    'Memory Limit Exceeded': ['mdi-database-alert-outline', 'error'],
    'Time Limit Exceeded': ['mdi-timer-alert-outline', 'error'],
    'Wrong Answer': ['mdi-close', 'error'],
    'Compile Error': ['mdi-code-braces', 'error'],
    'Internal Error': ['mdi-help-circle-outline', ''],
    'Runtime Error': ['mdi-alert-decagram-outline', 'error'],
    Running: ['mdi-play', 'indigo'],
    Queued: ['mdi-timer-sand', 'indigo']
  }
  const display = computed(
    () => knownStatus[props.status ?? ''] ?? ['mdi-circle-outline', 'warning']
  )
  const status = computed(() => {
    const status = props.status || 'Unknown'
    if (!props.abbrev) return status
    const abbrev = status
      .split(' ')
      .map((word) => word[0].toUpperCase())
      .join('')
    return abbrev.length > 1 ? abbrev : status.slice(0, 2).toUpperCase()
  })
  return { display, status }
}
