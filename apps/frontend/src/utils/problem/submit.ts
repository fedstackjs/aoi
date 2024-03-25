import { toRef, type MaybeRef, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { computeSHA256Progress } from '../files'
import { http, prettyHTTPError } from '../http'

export function useProblemSubmit(
  problemId: MaybeRef<string>,
  contestId: MaybeRef<string | undefined>,
  manual: MaybeRef<boolean>
) {
  const problemIdRef = toRef(problemId)
  const contestIdRef = toRef(contestId)
  const manualRef = toRef(manual)

  const toast = useToast()
  const router = useRouter()
  const route = useRoute()
  const { t } = useI18n()

  const submitting = ref(false)
  const submitMsg = ref('')
  const indeterminate = ref(true)
  const progress = ref(0)

  async function submit(file: File) {
    const contestId = contestIdRef.value
    const problemId = problemIdRef.value
    const manual = manualRef.value
    submitting.value = true
    indeterminate.value = true
    progress.value = 0
    submitMsg.value = t('msg.submitting')

    try {
      indeterminate.value = false
      submitMsg.value = t('msg.computing-hash', { progress: 0 })
      const hash = await computeSHA256Progress(file, (p) => {
        progress.value = p * 100
        submitMsg.value = t('msg.computing-hash', { progress: progress.value.toFixed(1) })
      })
      indeterminate.value = true
      submitMsg.value = t('msg.submitting')

      const size = file.size
      let url = contestId
        ? `contest/${contestId}/problem/${problemId}/solution`
        : `problem/${problemId}/solution`
      const { solutionId, uploadUrl } = await http
        .post(url, {
          json: { hash, size }
        })
        .json<{
          solutionId: string
          uploadUrl: string
        }>()
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file
      })
      if (!manual) {
        url = contestId
          ? `contest/${contestId}/solution/${solutionId}/submit`
          : `problem/${problemId}/solution/${solutionId}/submit`
        await http.post(url)
      }
      toast.success(t('submit-success'))
      url = contestId
        ? `/org/${route.params.orgId}/contest/${contestId}/solution/${solutionId}`
        : `/org/${route.params.orgId}/problem/${problemId}/solution/${solutionId}`
      router.push(url)
    } catch (err) {
      toast.error(await prettyHTTPError(err))
    }
    submitting.value = false
  }

  return { submitting, submitMsg, indeterminate, progress, submit }
}
