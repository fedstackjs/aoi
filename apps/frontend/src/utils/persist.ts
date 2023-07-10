import { syncRef, useLocalStorage } from '@vueuse/core'
import type { Ref } from 'vue'

export const attachToLocalStorage = <T>(key: string, ref: Ref<T>) => {
  const persisted = useLocalStorage(key, ref.value)
  syncRef(persisted, ref)
  return persisted
}
