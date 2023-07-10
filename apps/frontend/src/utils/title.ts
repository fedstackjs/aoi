import { useAppState } from '@/stores/app'
import { syncRef } from '@vueuse/core'
import { toRef, type Ref, onBeforeUnmount } from 'vue'

export const withTitle = (title: string | Ref<string>) => {
  const appState = useAppState()
  const oldTitle = appState.title
  if (typeof title === 'string') {
    appState.title = title
    onBeforeUnmount(() => {
      appState.title = oldTitle
    })
  } else {
    const unsync = syncRef(title, toRef(appState, 'title'), { direction: 'ltr', immediate: true })
    onBeforeUnmount(() => {
      unsync()
      appState.title = oldTitle
    })
  }
  return toRef(appState, 'title')
}
