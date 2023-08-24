import { useAsyncState } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import { ref, type MaybeRef, isRef } from 'vue'
import { http } from './http'

export function usePagination<T>(endpoint: string, params: MaybeRef<Record<string, unknown>>) {
  const page = useRouteQuery('page', '1', { transform: Number })
  const itemsPerPage = ref(15)
  let cachedCount = -1
  const result = useAsyncState(
    async (page, itemsPerPage) => {
      console.log(page, itemsPerPage)
      const { items, total } = await http
        .get(endpoint, {
          searchParams: {
            page: page,
            perPage: itemsPerPage,
            count: cachedCount === -1,
            ...(isRef(params) ? params.value : params)
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
  return { page, itemsPerPage, result }
}
