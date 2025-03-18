import { computed } from 'vue'

import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'

export interface IInstanceDeleteBtnProps {
  instanceId: string
  onDeleted?: () => void
}

export function useInstanceDeleteBtn(props: IInstanceDeleteBtnProps) {
  const deleteInstanceTask = useAsyncTask(async () => {
    await http.post(`instance/${props.instanceId}/destroy`)
    props.onDeleted?.()
  })

  return {
    deleteInstanceTask
  }
}
