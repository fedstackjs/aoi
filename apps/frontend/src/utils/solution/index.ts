import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export const solutionStates: Record<string, [string, string, string]> = {
  0: ['created', 'mdi-moon-new', 'grey'],
  1: ['pending', 'mdi-timer-sand', 'orange'],
  2: ['queued', 'mdi-cloud-outline', 'blue'],
  3: ['running', 'mdi-play', 'indigo'],
  4: ['completed', 'mdi-check', 'success']
} as const

export function useSolutionStateOptions() {
  const { t } = useI18n()
  return computed(() =>
    Object.entries(solutionStates).map(([value, [title]]) => ({
      title: t(`solution.state.${title}`),
      value
    }))
  )
}

export const solutionStatus: Record<string, [string, string]> = {
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

export function useSolutionStatusOptions() {
  const { t } = useI18n()
  return computed(() => Object.entries(solutionStatus).map(([value]) => value))
}
