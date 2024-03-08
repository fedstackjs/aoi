import { computed, reactive, watch } from 'vue'
import type { useSolutionList } from './SolutionList'

export function useSolutionFilter(filter: ReturnType<typeof useSolutionList>['filter']) {
  const local = reactive({
    userId: '',
    contestId: '',
    problemId: '',
    state: '',
    status: '',
    submittedAtL: '',
    submittedAtR: '',
    scoreL: '',
    scoreR: ''
  })

  function reset() {
    local.userId = filter.userId.value
    local.contestId = filter.contestId.value
    local.problemId = filter.problemId.value
    local.state = filter.state.value
    local.status = filter.status.value
    local.submittedAtL = filter.submittedAtL.value
    local.submittedAtR = filter.submittedAtR.value
    local.scoreL = filter.scoreL.value
    local.scoreR = filter.scoreR.value
  }

  function apply() {
    filter.userId.value = local.userId ?? ''
    filter.contestId.value = local.contestId ?? ''
    filter.problemId.value = local.problemId ?? ''
    filter.state.value = local.state ?? ''
    filter.status.value = local.status ?? ''
    filter.submittedAtL.value = local.submittedAtL ?? ''
    filter.submittedAtR.value = local.submittedAtR ?? ''
    filter.scoreL.value = local.scoreL ?? ''
    filter.scoreR.value = local.scoreR ?? ''
  }

  reset()
  watch(() => Object.values(filter).map((v) => v.value), reset)

  const filterActive = computed(() => Object.values(filter).some((v) => v.value))

  return { local, reset, apply, filterActive }
}
