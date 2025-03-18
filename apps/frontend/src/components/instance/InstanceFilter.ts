import { computed, reactive, watch } from 'vue'

export interface IInstanceFilter {
  userId: {
    value: string
  }
  problemId: {
    value: string
  }
  contestId: {
    value: string
  }
  state: {
    value: string
  }
}

export function useInstanceFilter(filter: IInstanceFilter) {
  const local = reactive({
    userId: '',
    problemId: '',
    contestId: '',
    state: ''
  })

  function reset() {
    local.userId = filter.userId.value
    local.problemId = filter.problemId.value
    local.contestId = filter.contestId.value
    local.state = filter.state.value
  }

  function apply() {
    filter.userId.value = local.userId ?? ''
    filter.problemId.value = local.problemId ?? ''
    filter.contestId.value = local.contestId ?? ''
    filter.state.value = local.state ?? ''
  }

  reset()
  watch(() => Object.values(filter).map((v) => v.value), reset)

  const filterActive = computed(() => Object.values(filter).some((v) => v.value))

  return { local, reset, apply, filterActive }
}
