import { ref, type MaybeRef, toRef } from 'vue'
import { useAsyncTask } from '../async'
import { http } from '../http'

export function useChangePassword(userId: MaybeRef<string>) {
  const oldPassword = ref('')
  const newPassword = ref('')
  const userIdRef = toRef(userId)
  const updateTask = useAsyncTask(async () => {
    await http.patch(`user/${userIdRef.value}/password`, {
      json: {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      }
    })
  })
  return { oldPassword, newPassword, updateTask }
}
