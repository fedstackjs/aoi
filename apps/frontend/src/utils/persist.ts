import { syncRef, useLocalStorage } from '@vueuse/core'
import type { Ref } from 'vue'

export const attachToLocalStorage = <T>(key: string, ref: Ref<T>) => {
  const persisted = useLocalStorage(key, ref.value)
  // @ts-expect-error vueuse type is wrong here
  syncRef(persisted, ref)
  return persisted
}
