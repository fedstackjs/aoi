import { computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import { useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'

export interface IInstanceCreateBtnProps {
  orgId: string
  problemId: string
  contestId?: string
}

export function useInstanceCreateBtn(props: IInstanceCreateBtnProps) {
  const router = useRouter()
  const canCreateInstance = computed(() => props.problemId)
  const createInstanceTask = useAsyncTask(async () => {
    if (props.contestId) {
      await http.post(`contest/${props.contestId}/problem/${props.problemId}/instance`)
      nextTick(() => router.push(`/org/${props.orgId}/contest/${props.contestId}/instance`))
    } else {
      await http.post(`problem/${props.problemId}/instance`)
      nextTick(() => router.push(`/org/${props.orgId}/problem/${props.problemId}/instance`))
    }
  })

  return {
    canCreateInstance,
    createInstanceTask
  }
}
