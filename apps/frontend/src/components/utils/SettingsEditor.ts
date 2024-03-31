import { useAsyncState } from '@vueuse/core'
import { HTTPError } from 'ky'
import { watch, nextTick, computed } from 'vue'

import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ISettingsEditorProps<T = any, Text extends boolean = false> {
  endpoint: string
  allowDelete?: boolean
  init?: () => T
  text?: Text
}

export interface ISettingsEditorEmits {
  (ev: 'updated'): void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSettingsEditor<T = any, Text extends boolean = false>(
  props: ISettingsEditorProps<T, Text>,
  emit: ISettingsEditorEmits
) {
  type SettingsType = Text extends true ? { text: string } : T
  const text = computed(() => props.text !== undefined && props.text !== false)
  const parser = (data: T) =>
    (text.value ? { text: JSON.stringify(data, null, 2) } : data) as SettingsType
  const serializer = (data: unknown) =>
    text.value ? JSON.parse((data as Exclude<SettingsType, T>).text) : (data as T)

  const settings = useAsyncState(
    async () => {
      try {
        const data = await http.get(props.endpoint).json<T>()
        return parser(data)
      } catch (err) {
        if (err instanceof HTTPError && props.allowDelete && err.response.status === 404) {
          const data = props.init?.() as T
          return parser(data)
        }
        throw err
      }
    },
    null as SettingsType,
    { shallow: false }
  )

  watch(
    () => props.endpoint,
    () => settings.execute()
  )

  const patchSettings = useAsyncTask(async () => {
    await http.patch(props.endpoint, { json: serializer(settings.state.value) })
    emit('updated')
    nextTick(() => settings.execute())
  })

  const deleteSettings = useAsyncTask(async () => {
    await http.delete(props.endpoint)
    emit('updated')
    nextTick(() => settings.execute())
  })

  return { settings, patchSettings, deleteSettings }
}
