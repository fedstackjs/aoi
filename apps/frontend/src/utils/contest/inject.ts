import { useAsyncState } from '@vueuse/core'
import { toRef, type MaybeRef, type InjectionKey, provide, type Ref, inject, computed } from 'vue'
import { http } from '../http'
import { hasCapability, contestBits } from '../capability'
import type { IContestDTO } from '@/components/contest/types'

const kContest: InjectionKey<Ref<IContestDTO>> = Symbol('contest')

export function useContest(orgId: MaybeRef<string>, contestId: MaybeRef<string>) {
  const orgIdRef = toRef(orgId)
  const contestIdRef = toRef(contestId)
  const contest = useAsyncState(async () => {
    const resp = await http.get(`contest/${contestIdRef.value}`)
    const data = await resp.json<IContestDTO>()
    if (data.orgId !== orgIdRef.value) throw new Error('orgId not match')
    return data
  }, null as never)
  provide(kContest, contest.state)
  const hasCapabilityRef = (type: keyof typeof contestBits) =>
    computed(() => hasCapability(contest.state.value?.capability ?? '0', contestBits[type]))
  // TODO: handle cap_content
  return {
    contest,
    showRegistration: computed(() => {
      const val = contest.state.value
      if (!val) return false
      const { currentStage, capability } = val
      if (!currentStage.settings.registrationEnabled) {
        return hasCapability(capability, contestBits.admin)
      }
      if (!currentStage.settings.registrationAllowPublic) {
        return hasCapability(capability, contestBits.registration)
      }
      return true
    }),
    showAdminTab: hasCapabilityRef('admin')
  }
}

export function useContestCapability(type: keyof typeof contestBits) {
  const contest = inject(kContest)
  if (!contest) throw new Error('No contest provided')
  return computed(() => hasCapability(contest?.value.capability, contestBits[type]))
}

export function useContestSettings() {
  const contest = inject(kContest)
  if (!contest) throw new Error('No contest provided')
  return computed(() => contest.value.currentStage.settings)
}

export function useContestData() {
  const contest = inject(kContest)
  if (!contest) throw new Error('No contest provided')
  return computed(() => contest.value)
}
