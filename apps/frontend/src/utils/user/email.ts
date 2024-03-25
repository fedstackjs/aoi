import { ref, type MaybeRef, toRef } from 'vue'

import { useAsyncTask } from '../async'
import { http } from '../http'

import { useAppState } from '@/stores/app'

export function useChangeEmail(userId: MaybeRef<string>) {
  const newEmail = ref('')
  const emailCode = ref('')
  const userIdRef = toRef(userId)
  const app = useAppState()
  const sendEmailTask = useAsyncTask(async () => {
    await http.post(`user/${userIdRef.value}/preBind`, {
      json: {
        provider: 'mail',
        payload: {
          email: newEmail.value
        },
        mfaToken: app.mfaToken
      }
    })
  })
  const updateEmailTask = useAsyncTask(async () => {
    await http.post(`user/${userIdRef.value}/bind`, {
      json: {
        provider: 'mail',
        payload: {
          code: emailCode.value
        },
        mfaToken: app.mfaToken
      }
    })
  })
  return { newEmail, emailCode, sendEmailTask, updateEmailTask }
}
