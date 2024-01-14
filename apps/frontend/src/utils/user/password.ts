import { ref, type MaybeRef, toRef } from 'vue'
import { useAsyncTask } from '../async'
import { http } from '../http'

export function useChangePassword(userId: MaybeRef<string>) {
  const oldPassword = ref('')
  const newPassword = ref('')
  const userIdRef = toRef(userId)
  const updateTask = useAsyncTask(async () => {
    await http.post(`user/${userIdRef.value}/bind`, {
      json: {
        provider: 'password',
        payload: {
          oldPassword: oldPassword.value,
          password: newPassword.value
        }
      }
    })
  })
  return { oldPassword, newPassword, updateTask }
}
