<template>
  <VCardSubtitle>{{ t('solution.info') }}</VCardSubtitle>
  <AsyncState :state="solution">
    <template v-slot="{ value }">
      <VCardText>
        {{ JSON.stringify(value) }}
      </VCardText>
    </template>
  </AsyncState>
  <VCardSubtitle>{{ t('solution.details') }}</VCardSubtitle>
  <SolutionDetails :problem-id="problemId" :solution-id="solutionId" />
  <VCardSubtitle>{{ t('solution.data') }}</VCardSubtitle>
  <VCardActions>
    <DownloadBtn :endpoint="`problem/${props.problemId}/solution/${props.solutionId}/data`" />
    <VBtn :text="t('rejudge')" @click="submit.execute()" :loading="submit.isLoading.value" />
  </VCardActions>
</template>

<script setup lang="ts">
import type { ISolutionDTO } from '@/components/solution/types'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import AsyncState from '@/components/utils/AsyncState.vue'
import DownloadBtn from '@/components/utils/DownloadBtn.vue'
import { useAsyncTask } from '@/utils/async'
import SolutionDetails from '@/components/solution/SolutionDetails.vue'

const props = defineProps<{
  orgId: string
  problemId: string
  solutionId: string
}>()

const { t } = useI18n()

const solution = useAsyncState(async () => {
  return http.get(`problem/${props.problemId}/solution/${props.solutionId}`).json<ISolutionDTO>()
}, null)

const submit = useAsyncTask(async () => {
  await http.post(`problem/${props.problemId}/solution/${props.solutionId}/submit`)
})
</script>
