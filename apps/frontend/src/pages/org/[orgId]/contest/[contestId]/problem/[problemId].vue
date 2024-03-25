<template>
  <VCard variant="flat" v-if="contestProblem">
    <AsyncState :state="problem" hide-when-loading>
      <template v-slot="{ value }">
        <VCardTitle>
          <div class="d-flex justify-space-between">
            <div>
              <p class="text-h4">{{ value.title }}</p>
            </div>
            <div>
              <VChipGroup class="justify-end">
                <VChip v-for="tag in value.tags" class="mx-2" :key="tag">
                  {{ tag }}
                </VChip>
              </VChipGroup>
              <ProblemJumpBtn :problem-id="props.problemId" />
              <VBtn
                size="small"
                v-if="admin"
                prepend-icon="mdi-arrow-top-left"
                variant="outlined"
                color="info"
                :to="{
                  path: `/org/${orgId}/contest/${contestId}/solution`,
                  query: { problemId: problemId }
                }"
              >
                {{ t('jump-to-solutions') }}
              </VBtn>
            </div>
          </div>
          <div class="d-flex u-gap-2 pt-2">
            <VChip
              color="info"
              variant="outlined"
              :text="t('score', { score: contestProblem.settings.score })"
            />
            <VChip
              color="warning"
              variant="outlined"
              :text="t('solution-count-limit', { limit: solutionCountLimit })"
            />
          </div>
        </VCardTitle>
        <VDivider />

        <VTabs v-model="currentTab">
          <VTab prepend-icon="mdi-book-outline" value="desc">
            {{ t('tabs.problem-description') }}
          </VTab>
          <VTab
            prepend-icon="mdi-upload-outline"
            value="submit"
            v-if="value.config && (settings.solutionEnabled || admin)"
          >
            {{ t('tabs.submit') }}
          </VTab>
          <VTab prepend-icon="mdi-attachment" value="attachments">
            {{ t('tabs.attachments') }}
          </VTab>
          <VTab prepend-icon="mdi-cog-outline" value="management" v-if="admin">
            {{ t('tabs.management') }}
          </VTab>
        </VTabs>
        <VWindow v-model="currentTab">
          <VWindowItem value="desc">
            <VCard flat>
              <MarkdownRenderer :md="value.description" class="pa-4" />
            </VCard>
          </VWindowItem>
          <VWindowItem value="submit">
            <ProblemSubmit
              :contest-id="contestId"
              :problem="value"
              :manual-submit="!settings.solutionAllowSubmit"
            />
          </VWindowItem>
          <VWindowItem value="attachments">
            <ProblemTabAttachments :contest-id="contestId" :problem="value" />
          </VWindowItem>
          <VWindowItem value="management">
            <ProblemTabAdmin :contest-id="contestId" :problem="value" @updated="emit('updated')" />
          </VWindowItem>
        </VWindow>
      </template>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ProblemJumpBtn from '@/components/contest/ProblemJumpBtn.vue'
import ProblemTabAdmin from '@/components/contest/ProblemTabAdmin.vue'
import ProblemTabAttachments from '@/components/contest/ProblemTabAttachments.vue'
import type {
  IContestDTO,
  IContestProblemDTO,
  IContestProblemListDTO
} from '@/components/contest/types'
import ProblemSubmit from '@/components/problem/ProblemSubmit.vue'
import AsyncState from '@/components/utils/AsyncState.vue'
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'
import { useAppState } from '@/stores/app'
import { useContestCapability, useContestSettings } from '@/utils/contest/inject'
import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  problems: IContestProblemListDTO[]
  problemId: string
}>()

const { t } = useI18n()
const currentTab = ref()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const settings = useContestSettings()
const admin = useContestCapability('admin')

const problem = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/problem/${props.problemId}`)
  return resp.json<IContestProblemDTO>()
}, null)

const app = useAppState()

const solutionCount = useAsyncState(
  async () => {
    const { total } = await http
      .get(`contest/${props.contestId}/solution`, {
        searchParams: {
          userId: app.userId,
          problemId: props.problemId,
          count: true,
          perPage: 15,
          page: 1
        }
      })
      .json<{ total: number }>()
    return total
  },
  0,
  { immediate: true }
)

const contestProblem = computed(() => {
  return props.problems.find((p) => p._id === props.problemId)
})

const solutionCountLimit = computed(() => {
  const limit = contestProblem.value?.settings.solutionCountLimit ?? 0
  if (solutionCount.isLoading.value) return limit
  return `${solutionCount.state.value}/${limit}`
})

watch(
  () => props.problemId,
  () => {
    problem.execute()
    solutionCount.execute()
  }
)
</script>

<i18n global>
  en:
    problem-description: Description
    problem-submit: Submit
    problem-attachments: Attachments
    problem-data: Data
    problem-management: Management
    problem-solutions: solution
    solutions: solutions
    status: Status
    jump-to-solutions: Jump to solutions
    score: 'Score: {score}'
    solution-count-limit: 'Solution count limit: {limit}'
  zh-Hans:
    problem-description: 题面
    problem-submit: 提交
    problem-attachments: 附件
    problem-data: 数据
    problem-management: 管理
    problem-solutions: 提交记录
    solutions: 提交记录
    status: 状态
    jump-to-solutions: 跳转到提交记录
    score: 分数：{score}
    solution-count-limit: 提交次数限制：{limit}
  </i18n>
