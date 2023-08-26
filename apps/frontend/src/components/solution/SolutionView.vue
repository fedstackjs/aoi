<template>
  <AsyncState :state="solution">
    <template v-slot="{ value }">
      <VCardText>
        <VTable>
          <thead>
            <th class="text-left">{{ t('term.id') }}</th>
            <th class="text-center">{{ t('term.state') }}</th>
            <th class="text-center">{{ t('term.hash') }}</th>
            <th class="text-center">{{ t('term.runner-label') }}</th>
            <th class="text-center" v-text="t('common.created-at')" />
            <th class="text-center" v-if="value.submittedAt" v-text="t('common.submitted-at')" />
          </thead>
          <tbody>
            <tr>
              <td>
                <code>{{ value._id }}</code>
              </td>
              <td class="text-center">
                <SolutionStateChip :state="value.state" />
              </td>
              <td class="text-center">
                <VChip color="blue" variant="outlined">
                  <code>{{ value.problemDataHash.substring(0, 7) }}</code>
                </VChip>
              </td>
              <td class="text-center">
                <VChip color="success" variant="outlined">
                  <code>{{ value.label }}</code>
                </VChip>
              </td>
              <td class="text-center" v-text="new Date(value.createdAt).toLocaleString()" />
              <td
                class="text-center"
                v-if="value.submittedAt"
                v-text="new Date(value.submittedAt).toLocaleString()"
              />
            </tr>
          </tbody>
        </VTable>
        <VTable v-if="value.state > 2">
          <thead>
            <th class="text-left">{{ t('term.status') }}</th>
            <th class="text-center">{{ t('term.score') }}</th>
            <th class="text-center" v-for="(_, mkey) in value.metrics" :key="mkey">
              {{ t('metrics.' + mkey) }}
            </th>
            <th class="text-center" v-if="value.completedAt" v-text="t('common.completed-at')" />
            <th class="text-right">{{ t('term.message') }}</th>
          </thead>
          <tbody>
            <tr>
              <th class="text-left">
                <SolutionStatusChip :status="value.status" />
              </th>
              <th class="text-center">
                <SolutionScoreDisplay :score="value.score" />
              </th>
              <th v-for="(mval, mkey) in value.metrics" :key="mkey" class="text-center">
                {{ mval }}
              </th>
              <td
                class="text-center"
                v-if="value.completedAt"
                v-text="new Date(value.completedAt).toLocaleString()"
              />
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
  <VCardSubtitle>{{ t('term.actions') }}</VCardSubtitle>
  <VCardActions>
    <DownloadBtn :endpoint="downloadEndpoint" />
    <VBtn
      v-if="admin"
      :text="t('action.rejudge')"
      @click="submit.execute()"
      :loading="submit.isLoading.value"
    />
    <VBtn
      :text="t('action.refresh')"
      @click="solution.execute()"
      :loading="solution.isLoading.value"
      :disabled="autoRefresh.isActive.value"
    />
    <VBtn :text="t('action.view')" @click="viewFile = true" />
  </VCardActions>
  <VCardText v-if="viewFile">
    <ZipAutoViewer :endpoint="downloadEndpoint" />
  </VCardText>
</template>

<script setup lang="ts">
import type { ISolutionDTO } from '@/components/solution/types'
import { http } from '@/utils/http'
import { useAsyncState, useIntervalFn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import AsyncState from '@/components/utils/AsyncState.vue'
import DownloadBtn from '@/components/utils/DownloadBtn.vue'
import { useAsyncTask } from '@/utils/async'
import SolutionDetails from '@/components/solution/SolutionDetails.vue'
import SolutionStateChip from '@/components/solution/SolutionStateChip.vue'
import ZipAutoViewer from '../utils/zip/ZipAutoViewer.vue'
import { ref } from 'vue'
import SolutionStatusChip from './SolutionStatusChip.vue'
import SolutionScoreDisplay from './SolutionScoreDisplay.vue'
import { computed } from 'vue'

const props = defineProps<{
  orgId: string
  problemId?: string
  contestId?: string
  solutionId: string
  admin?: boolean
}>()

const { t } = useI18n()

const downloadEndpoint = computed(() =>
  props.contestId
    ? `contest/${props.contestId}/solution/${props.solutionId}/data`
    : `problem/${props.problemId}/solution/${props.solutionId}/data`
)

const viewFile = ref(false)

const solution = useAsyncState(
  async () => {
    const url = props.contestId
      ? `contest/${props.contestId}/solution/${props.solutionId}`
      : `problem/${props.problemId}/solution/${props.solutionId}`
    return http.get(url).json<ISolutionDTO>()
  },
  null,
  { resetOnExecute: false }
)

const submit = useAsyncTask(async () => {
  const url = props.contestId
    ? `contest/${props.contestId}/solution/${props.solutionId}/submit`
    : `problem/${props.problemId}/solution/${props.solutionId}/submit`
  await http.post(url)
  solution.execute()
  autoRefresh.resume()
})

const autoRefresh = useIntervalFn(() => {
  if (solution.state.value?.state !== 4 && solution.state.value?.state !== 0) {
    solution.execute()
  } else {
    autoRefresh.pause()
  }
})
</script>
<i18n>
en:
  solution:
    info: Info
    details: Details
    data: Data
zh-Hans:
  solution:
    info: 信息
    details: 细节
    data: 数据
</i18n>
