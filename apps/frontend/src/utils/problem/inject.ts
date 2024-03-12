import type { IProblemDTO } from '@/components/problem/types'
import { useAsyncState } from '@vueuse/core'
import { toRef, type MaybeRef, type InjectionKey, provide, type Ref, inject, computed } from 'vue'
import { http } from '../http'
import { hasCapability, problemBits } from '../capability'

const kProblem: InjectionKey<Ref<IProblemDTO>> = Symbol('problem')

export function useProblem(orgId: MaybeRef<string>, problemId: MaybeRef<string>) {
  const problemIdRef = toRef(problemId)
  const orgIdRef = toRef(orgId)
  const problem = useAsyncState(async () => {
    const resp = await http.get(`problem/${problemIdRef.value}`)
    const data = await resp.json<IProblemDTO>()
    if (data.orgId !== orgIdRef.value) throw new Error('Bad request')
    return data
  }, null as never)
  provide(kProblem, problem.state)
  const hasCapabilityRef = (type: keyof typeof problemBits) =>
    computed(() => hasCapability(problem.state.value?.capability ?? '0', problemBits[type]))
  // TODO: handle cap_content
  return {
    problem,
    showDataTab: hasCapabilityRef('data'),
    showAdminTab: hasCapabilityRef('admin')
  }
}

export function useProblemAdminCapability() {
  const problem = inject(kProblem)
  if (!problem) throw new Error('No problem provided')
  return computed(() => hasCapability(problem?.value.capability, problemBits.admin))
}

export function useProblemCapability(type: keyof typeof problemBits) {
  const problem = inject(kProblem)
  if (!problem) throw new Error('No problem provided')
  return computed(() => hasCapability(problem?.value.capability, problemBits[type]))
}

export function useProblemSettings() {
  const problem = inject(kProblem)
  if (!problem) throw new Error('No problem provided')
  return computed(() => problem?.value.settings)
}
