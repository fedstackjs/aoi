<template>
  <AsyncState :state="solution">
    <template v-slot="{ value }">
      <VCardText>
        <VTable>
          <thead>
            <!-- <th class="text-left">{{ t('term.id') }}</th> -->
            <th class="text-center">{{ t('term.state') }}</th>
            <!-- <th class="text-center">{{ t('term.hash') }}</th>
            <th class="text-center">{{ t('term.runner-label') }}</th> -->
            <th class="text-center">{{ t('term.user') }}</th>
            <th class="text-center">{{ t('term.title') }}</th>
            <th class="text-center" v-text="t('common.created-at')" />
            <th class="text-center" v-if="value.submittedAt" v-text="t('common.submitted-at')" />
          </thead>
          <tbody>
            <tr>
              <!-- <td>
                <code>{{ value._id }}</code>
              </td> -->
              <td class="text-center">
                <SolutionStateChip :state="value.state" />
              </td>
              <!-- <td class="text-center">
                <VChip color="blue" variant="outlined">
                  <code>{{ value.problemDataHash.substring(0, 7) }}</code>
                </VChip>
              </td>
              <td class="text-center">
                <VChip color="success" variant="outlined">
                  <code>{{ value.label }}</code>
                </VChip>
              </td> -->
              <td class="text-center">
                <PrincipalProfile :principal-id="value.userId" />
              </td>
              <td class="text-center">
                <code>{{ useContestProblemTitle(value.problemId)?.value }}</code>
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
              <td class="text-left">
                <SolutionStatusChip :status="value.status" />
              </td>
              <td class="text-center">
                <SolutionScoreDisplay :score="value.score" />
              </td>
              <td v-for="(mval, mkey) in value.metrics" :key="mkey" class="text-center">
                {{ mval }}
              </td>
              <td
                class="text-center"
                v-if="value.completedAt"
                v-text="new Date(value.completedAt).toLocaleString()"
              />
              <td class="text-right">{{ value.message }}</td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
    </template>
  </AsyncState>
  <VDivider />
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
    <VBtn v-if="showData && !viewFile" :text="t('action.view')" @click="viewFile = true" />
  </VCardActions>
  <VCardText v-if="showData && viewFile">
    <ZipAutoViewer :endpoint="downloadEndpoint" default-file="answer.code" />
  </VCardText>
  <template v-if="showDetails && solution.state.value?.state === 4">
    <VDivider />
    <VCardSubtitle>{{ t('solution.details') }}</VCardSubtitle>
    <SolutionDetails :problem-id="problemId" :contest-id="contestId" :solution-id="solutionId" />
  </template>
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
import PrincipalProfile from '../utils/PrincipalProfile.vue'
import { computed } from 'vue'
import { useContestProblemTitle } from '@/utils/contest/problem/inject'
import { useContestCapability, useContestSettings } from '@/utils/contest/inject'
import { useAppState } from '@/stores/app'

const props = defineProps<{
  orgId: string
  problemId?: string
  contestId?: string
  solutionId: string
  admin?: boolean
}>()

const { t } = useI18n()

const app = useAppState()
const contestSettings = props.contestId ? useContestSettings() : null
const contestCapability = props.contestId ? useContestCapability('admin') : null
const showDetails = computed(() => {
  if (!contestSettings) return true // Problem
  if (contestCapability?.value) return true
  if (solution.state.value?.userId === app.userId) {
    return !!contestSettings.value.solutionShowDetails
  }
  return !!contestSettings.value.solutionShowOtherDetails
})
const showData = computed(() => {
  if (!contestSettings) return true // Problem
  if (contestCapability?.value) return true
  if (solution.state.value?.userId === app.userId) {
    return true
  }
  return !!contestSettings.value.solutionShowOtherData
})

const downloadEndpoint = computed(() =>
  props.contestId
    ? `contest/${props.contestId}/solution/${props.solutionId}/data`
    : `problem/${props.problemId}/solution/${props.solutionId}/data`
)

const viewFile = ref(true)

const solution = useAsyncState(
  async () => {
    const url = props.contestId
      ? `contest/${props.contestId}/solution/${props.solutionId}`
      : `problem/${props.problemId}/solution/${props.solutionId}`
    return await http.get(url).json<ISolutionDTO>()
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
