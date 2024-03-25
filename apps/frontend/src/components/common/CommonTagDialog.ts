import { useAsyncState } from '@vueuse/core'

import { http } from '@/utils/http'

export interface ICommonTagDialogProps {
  endpoint: string
  target: string
  query?: Record<string, string>
}

export function useCommonTagDialog(props: ICommonTagDialogProps) {
  const tags = useAsyncState(
    async () => {
      const tags = await http.get(props.endpoint, { searchParams: props.query }).json<string[]>()
      return tags.map((tag) => ({ label: tag, to: props.target.replace(/:tag/g, tag) }))
    },
    [],
    { immediate: true }
  )
  return { tags }
}
