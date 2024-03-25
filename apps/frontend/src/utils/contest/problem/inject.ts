import { useAsyncState } from '@vueuse/core'
import { toRef, type MaybeRef, type InjectionKey, provide, type Ref, inject, computed } from 'vue'

import type { IContestProblemListDTO } from '@/components/contest/types'
import { http } from '@/utils/http'

export const kContestProblemList: InjectionKey<Ref<IContestProblemListDTO[]>> =
  Symbol('contest-problem-list')

export function useContestProblemList(contestId: MaybeRef<string>) {
  const contestIdRef = toRef(contestId)
  const problems = useAsyncState(async () => {
    const resp = await http.get(`contest/${contestIdRef.value}/problem`)
    const data = await resp.json<IContestProblemListDTO[]>()
    // sort by slug lexically
    data.sort((a, b) => a.settings.slug.localeCompare(b.settings.slug))
    return data
  }, null as never)
  provide(kContestProblemList, problems.state)
  return problems
}

export function useContestProblemTitle(_id: string) {
  const problems = inject(kContestProblemList)
  if (!problems) throw new Error('No problems provided')
  return computed(() => problems.value?.find((problem) => problem._id === _id)?.title)
}
