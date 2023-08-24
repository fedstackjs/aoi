<template>
  <AsyncState :state="solution">
    <template v-slot="{ value }">
      <VCardText>
        <VTable>
          <thead>
            <th class="text-left">{{ t('term.id') }}</th>
            <th class="text-center">{{ t('term.state') }}</th>
            <th class="text-center">{{ t('term.score') }}</th>
            <th class="text-center" v-for="(mval, mkey) in value.metrics" :key="mkey">
              {{ t('metrics.' + mkey) }}
            </th>
            <th class="text-center">{{ t('term.status') }}</th>
            <th class="text-center" v-if="value.submittedAt">
              {{ t('common.submitted-at') }}
            </th>
            <th class="text-right">{{ t('term.message') }}</th>
          </thead>
          <tbody>
            <tr>
              <th>
                <code>{{ value._id }}</code>
              </th>
              <th class="text-center">
                <SolutionStateChip :state="value.state" />
              </th>
              <th class="text-center">{{ value.score }}</th>
              <th v-for="(mval, mkey) in value.metrics" :key="mkey" class="text-center">
                {{ mval }}
              </th>
              <th class="text-center">{{ value.status }}</th>
              <th class="text-center" v-if="value.submittedAt">
                {{ new Date(value.submittedAt).toLocaleString() }}
              </th>
              <th class="text-right">{{ value.message }}</th>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </template>
  </AsyncState>
  <VDivider />
  <template v-if="solution.state.value?.state === 4">
    <VCardSubtitle>{{ t('solution.details') }}</VCardSubtitle>
    <SolutionDetails :problem-id="problemId" :contest-id="contestId" :solution-id="solutionId" />
    <VDivider />
  </template>
  <VCardSubtitle>{{ t('solution.data') }}</VCardSubtitle>
  <VCardActions>
    <DownloadBtn :endpoint="`problem/${props.problemId}/solution/${props.solutionId}/data`" />
    <VBtn :text="t('action.rejudge')" @click="submit.execute()" :loading="submit.isLoading.value" />
    <VBtn :text="t('action.view')" @click="viewFile = true" />
  </VCardActions>
  <VCardText v-if="viewFile">
    <ZipAutoViewer :endpoint="`problem/${props.problemId}/solution/${props.solutionId}/data`" />
  </VCardText>
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
import ZipAutoViewer from '../utils/zip/ZipAutoViewer.vue'
import { ref } from 'vue'

const props = defineProps<{
  orgId: string
  problemId?: string
  contestId?: string
  solutionId: string
}>()

const { t } = useI18n()

const viewFile = ref(false)

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
