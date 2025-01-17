import { useToast } from 'vue-toastification'

import type { IContestAction } from '@/types'

export const useContestAction = () => {
  const toast = useToast()
  const execute = (action: IContestAction) => {
    try {
      switch (action.type) {
        case 'link':
          window.open(action.target, '_blank')
          break
        case 'toast':
          toast.info(action.target)
          break
      }
    } catch (err) {
      toast.error(`${err}`)
    }
  }
  return { execute }
}
