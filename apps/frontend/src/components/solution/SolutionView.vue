<template>
  <VCardSubtitle>{{ t('solution.info') }}</VCardSubtitle>
  <AsyncState :state="solution">
    <template v-slot="{ value }">
      <VCardText>
        <VTable>
          <thead>
            <th class="text-left">{{ t('term.id') }}</th>
            <th class="text-left">{{ t('term.state') }}</th>
            <th class="text-left">{{ t('term.score') }}</th>
            <th class="text-left" v-for="(mval, mkey) in value.metrics" :key="mkey">
              {{ t('metrics.' + mkey) }}
            </th>
            <th class="text-left">{{ t('term.status') }}</th>
            <th class="text-left">{{ t('term.message') }}</th>
            <th class="text-left" v-if="value.submittedAt">
              {{ t('term.submitted-at') }}
            </th>
          </thead>
          <tbody>
            <tr>
              <th>{{ value._id }}</th>
              <th>
                <SolutionStateChip :state="value.state" />
              </th>
              <th>{{ value.score }}</th>
              <th v-for="(mval, mkey) in value.metrics" :key="mkey">
                {{ mval }}
              </th>
              <th>{{ value.status }}</th>
              <th>{{ value.message }}</th>
              <th v-if="value.submittedAt">{{ value.submittedAt }}</th>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </template>
  </AsyncState>
  <VCardSubtitle>{{ t('solution.details') }}</VCardSubtitle>
  <SolutionDetails :problem-id="problemId" :contest-id="contestId" :solution-id="solutionId" />
  <VCardSubtitle>{{ t('solution.data') }}</VCardSubtitle>
  <VCardActions>
    <DownloadBtn :endpoint="`problem/${props.problemId}/solution/${props.solutionId}/data`" />
    <VBtn :text="t('action.rejudge')" @click="submit.execute()" :loading="submit.isLoading.value" />
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
import SolutionStateChip from '@/components/solution/SolutionStateChip.vue'

const props = defineProps<{
  orgId: string
  problemId?: string
  contestId?: string
  solutionId: string
}>()

const { t } = useI18n()

const solution = useAsyncState(async () => {
  const url = props.contestId
    ? `contest/${props.contestId}/solution/${props.solutionId}`
    : `problem/${props.problemId}/solution/${props.solutionId}`
  return http.get(url).json<ISolutionDTO>()
}, null)

const submit = useAsyncTask(async () => {
  const url = props.contestId
    ? `contest/${props.contestId}/solution/${props.solutionId}/submit`
    : `problem/${props.problemId}/solution/${props.solutionId}/submit`
  await http.post(url)
})
</script>
<i18n>
en:
  solution:
    info: Info
    details: Details
    data: Data
zhHans:
  solution:
    info: 信息
    details: 细节
    data: 数据
</i18n>
