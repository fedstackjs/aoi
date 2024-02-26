import type { IAppDTO } from '@/components/app/types'
import { toRef, type InjectionKey, provide, computed, inject, type MaybeRef, type Ref } from 'vue'
import { hasCapability, appBits } from '../capability'
import { useAsyncState } from '@vueuse/core'
import { http } from '../http'

const kApp: InjectionKey<Ref<IAppDTO>> = Symbol('app')

export function useApp(orgId: MaybeRef<string>, appId: MaybeRef<string>) {
  const orgIdRef = toRef(orgId)
  const appIdRef = toRef(appId)
  const app = useAsyncState(async () => {
    const resp = await http.get(`app/${appIdRef.value}`)
    const data = await resp.json<IAppDTO>()
    if (orgIdRef.value && data.orgId !== orgIdRef.value) throw new Error('orgId not match')
    return data
  }, null as never)
  provide(kApp, app.state)
  const hasCapabilityRef = (type: keyof typeof appBits) =>
    computed(() => hasCapability(app.state.value?.capability ?? '0', appBits[type]))
  return {
    app,
    showAdminTab: hasCapabilityRef('admin')
  }
}

export function useAppData() {
  const app = inject(kApp)
  if (!app) throw new Error('No app provided')
  return app
}

export function useAppCapability(type: keyof typeof appBits) {
  const app = useAppData()
  return computed(() => hasCapability(app?.value.capability, appBits[type]))
}
