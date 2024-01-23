import { useAsyncState } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { ref, type MaybeRef, watch, toRef, computed } from 'vue'
import { http } from './http'

function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>) {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

export function usePagination<T>(
  endpoint: MaybeRef<string>,
  params: MaybeRef<Record<string, unknown>>
) {
  const endpointRef = toRef(endpoint)
  const paramsRef = toRef(params)
  const page = useRouteQuery('page', '1', { transform: Number })
  const itemsPerPage = ref(15)
  let cachedCount = -1
  const result = useAsyncState(
    async (page, itemsPerPage) => {
      const { items, total } = await http
        .get(endpointRef.value, {
          searchParams: {
            page: page,
            perPage: itemsPerPage,
            count: cachedCount === -1,
            ...paramsRef.value
          }
        })
        .json<{ items: T[]; total: number }>()
      if (cachedCount === -1) {
        cachedCount = total
      }
      return { items, total: cachedCount }
    },
    { items: [], total: page.value * itemsPerPage.value },
    { resetOnExecute: false, immediate: false }
  )
  const reset = () => {
    cachedCount = -1
    page.value = 1
    result.execute(0, page.value, itemsPerPage.value)
  }
  watch(
    () => endpointRef.value,
    () => reset()
  )
  watch(
    () => paramsRef.value,
    (cur, old) => {
      if (shallowEqual(cur, old)) return
      reset()
    },
    { deep: true }
  )
  return { page, itemsPerPage, result, count: computed(() => cachedCount) }
}
