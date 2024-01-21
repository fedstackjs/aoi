import { ref, type MaybeRef, toRef } from 'vue'
import { useAsyncTask } from '../async'
import { http } from '../http'
import { useAppState } from '@/stores/app'

export function useChangePassword(userId: MaybeRef<string>) {
  const oldPassword = ref('')
  const newPassword = ref('')
  const userIdRef = toRef(userId)
  const app = useAppState()
  const updateTask = useAsyncTask(async () => {
    await http.post(`user/${userIdRef.value}/bind`, {
      json: {
        provider: 'password',
        payload: {
          oldPassword: oldPassword.value,
          password: newPassword.value
        },
        mfaToken: app.mfaToken
      }
    })
  })
  return { oldPassword, newPassword, updateTask }
}
