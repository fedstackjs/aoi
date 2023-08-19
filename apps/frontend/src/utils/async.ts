import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'

export function useAsyncTask(task: () => Promise<unknown>) {
  const toast = useToast()
  const { t } = useI18n()
  const isLoading = ref(false)
  const execute = async () => {
    if (isLoading.value) return
    isLoading.value = true
    try {
      await task()
      toast.success(t('common.operation-success'))
    } catch (err) {
      toast.error(`${err}`)
    }
    isLoading.value = false
  }
  return { isLoading, execute }
}
