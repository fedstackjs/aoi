import { useAsyncState } from '@vueuse/core'
import { toRef, type InjectionKey, provide, computed, inject, type MaybeRef, type Ref } from 'vue'

import { hasCapability, planBits } from '../capability'
import { http } from '../http'

import type { IPlanDTO } from '@/components/plan/types'

const kPlan: InjectionKey<Ref<IPlanDTO>> = Symbol('plan')

export function usePlan(orgId: MaybeRef<string>, planId: MaybeRef<string>) {
  const orgIdRef = toRef(orgId)
  const planIdRef = toRef(planId)
  const plan = useAsyncState(async () => {
    const resp = await http.get(`plan/${planIdRef.value}`)
    const data = await resp.json<IPlanDTO>()
    if (data.orgId !== orgIdRef.value) throw new Error('orgId not match')
    return data
  }, null as never)
  provide(kPlan, plan.state)
  const hasCapabilityRef = (type: keyof typeof planBits) =>
    computed(() => hasCapability(plan.state.value?.capability ?? '0', planBits[type]))
  return {
    plan,
    showAdminTab: hasCapabilityRef('admin')
  }
}

export function usePlanCapability(type: keyof typeof planBits) {
  const plan = inject(kPlan)
  if (!plan) throw new Error('No plan provided')
  return computed(() => hasCapability(plan?.value.capability, planBits[type]))
}
