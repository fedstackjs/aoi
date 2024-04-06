import { syncRef } from '@vueuse/core'
import {
  toRef,
  type Ref,
  onBeforeUnmount,
  type MaybeRef,
  computed,
  watch,
  type Component
} from 'vue'
import { useI18n } from 'vue-i18n'

import { useAppState } from '@/stores/app'

export function withTitle(title: string | Ref<string>) {
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

export function withI18nTitle(title: MaybeRef<string>) {
  const { t } = useI18n()
  const titleRef = toRef(title)
  const actualTitle = computed(() => t(titleRef.value))
  const appState = useAppState()
  const oldTitle = appState.title
  const unwatch = watch(
    () => actualTitle.value,
    (value) => (appState.title = value),
    { immediate: true }
  )
  onBeforeUnmount(() => {
    unwatch()
    appState.title = oldTitle
  })
}

export function withNavExtension<Props>(component: Component<Props>, props: MaybeRef<Props>) {
  const appState = useAppState()
  const oldComponent = appState.navBarExtension
  appState.navBarExtension = [component, toRef(props)]
  onBeforeUnmount(() => {
    appState.navBarExtension = oldComponent
  })
}
