import { ref, type MaybeRef, toRef } from 'vue'
import { useAsyncTask } from '../async'
import { http } from '../http'

export function useChangeEmail(userId: MaybeRef<string>) {
  const newEmail = ref('')
  const emailCode = ref('')
  const userIdRef = toRef(userId)
  const sendEmailTask = useAsyncTask(async () => {
    await http.post(`user/${userIdRef.value}/preBind`, {
      json: {
        provider: 'mail',
        payload: {
          email: newEmail.value
        }
      }
    })
  })
  const updateEmailTask = useAsyncTask(async () => {
    await http.post(`user/${userIdRef.value}/bind`, {
      json: {
        provider: 'mail',
        payload: {
          code: emailCode.value
        }
      }
    })
  })
  return { newEmail, emailCode, sendEmailTask, updateEmailTask }
}
