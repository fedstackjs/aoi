<template>
  <AsyncState v-if="contestProblem" :state="problem" hide-when-loading>
    <template v-slot="{ value }">
      <div v-intersect="{ handler: onIntersect, options: { rootMargin } }"></div>
      <VCard :class="$style.header" :density="shrinkHeader ? 'compact' : 'default'">
        <VFadeTransition mode="out-in">
          <div v-if="shrinkHeader">
            <VCardTitle class="pb-0">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <span class="text-h6">{{ value.title }}</span>
                </div>
                <div>
                  <VChipGroup class="justify-end">
                    <VChip v-for="tag in value.tags" class="mx-2" :key="tag" density="compact">
                      {{ tag }}
                    </VChip>
                  </VChipGroup>
                </div>
              </div>
            </VCardTitle>
            <div class="d-flex justify-space-between align-center">
              <VTabs v-model="currentTab" density="compact">
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
                <VTab
                  prepend-icon="mdi-timer-sand"
                  :to="{
                    path: `/org/${orgId}/contest/${contestId}/solution`,
                    query: { problemId }
                  }"
                >
                  {{ t('tabs.solutions') }}
                </VTab>
                <VTab prepend-icon="mdi-attachment" value="attachments">
                  {{ t('tabs.attachments') }}
                </VTab>
                <VTab prepend-icon="mdi-cog-outline" value="management" v-if="admin">
                  {{ t('tabs.management') }}
                </VTab>
                <template v-if="contestProblem.settings.actions">
                  <VBtn
                    v-for="action in contestProblem.settings.actions"
                    :key="action.title"
                    :text="action.title"
                    :prepend-icon="action.icon ?? 'mdi-link'"
                    variant="text"
                    class="align-self-center"
                    @click="execute(action)"
                  />
                </template>
              </VTabs>
              <div class="u-flex u-px-2 u-space-x-2">
                <VChip
                  color="info"
                  variant="outlined"
                  prepend-icon="mdi-star-four-points"
                  density="compact"
                  :text="'' + contestProblem.settings.score"
                />
                <VChip
                  :color="solutionCountLimit.color"
                  variant="outlined"
                  prepend-icon="mdi-format-vertical-align-top"
                  density="compact"
                  :text="'' + solutionCountLimit.limit"
                />
              </div>
            </div>
          </div>
          <div v-else>
            <VCardTitle>
              <div class="d-flex justify-space-between align-center">
                <div>
                  <span class="text-h4">{{ value.title }}</span>
                </div>
                <div>
                  <VChipGroup class="justify-end">
                    <VChip v-for="tag in value.tags" class="mx-2" :key="tag">
                      {{ tag }}
                    </VChip>
                  </VChipGroup>
                </div>
              </div>
              <div class="d-flex u-space-x-2 pt-2">
                <VChip
                  color="info"
                  variant="outlined"
                  prepend-icon="mdi-star-four-points"
                  :text="t('score', { score: contestProblem.settings.score })"
                />
                <VChip
                  :color="solutionCountLimit.color"
                  variant="outlined"
                  prepend-icon="mdi-format-vertical-align-top"
                  :text="t('solution-count-limit', { limit: solutionCountLimit.limit })"
                />
                <VChip
                  v-if="admin"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-arrow-top-left"
                  :text="t('jump-to-problem')"
                  :to="`/org/${orgId}/problem/${problemId}`"
                />
              </div>
            </VCardTitle>
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
              <VTab
                prepend-icon="mdi-timer-sand"
                :to="{
                  path: `/org/${orgId}/contest/${contestId}/solution`,
                  query: { problemId }
                }"
              >
                {{ t('tabs.solutions') }}
              </VTab>
              <VTab prepend-icon="mdi-attachment" value="attachments">
                {{ t('tabs.attachments') }}
              </VTab>
              <VTab prepend-icon="mdi-cog-outline" value="management" v-if="admin">
                {{ t('tabs.management') }}
              </VTab>
              <template v-if="contestProblem.settings.actions">
                <VBtn
                  v-for="action in contestProblem.settings.actions"
                  :key="action.title"
                  :text="action.title"
                  :prepend-icon="action.icon ?? 'mdi-link'"
                  variant="text"
                  class="align-self-center"
                  @click="execute(action)"
                />
              </template>
            </VTabs>
          </div>
        </VFadeTransition>
      </VCard>
      <VCard class="mt-2">
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
              :manual-submit="
                !settings.solutionAllowSubmit || contestProblem.settings.disableSubmit
              "
            />
          </VWindowItem>
          <VWindowItem value="attachments">
            <ProblemTabAttachments :contest-id="contestId" :problem="value" />
          </VWindowItem>
          <VWindowItem value="management">
            <ProblemTabAdmin :contest-id="contestId" :problem="value" @updated="emit('updated')" />
          </VWindowItem>
        </VWindow>
      </VCard>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay, useLayout } from 'vuetify'

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
import { useContestAction } from '@/utils/contest/action'
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
const layout = useLayout()
const display = useDisplay()
const rootMargin = computed(() => `-${layout.mainRect.value.top}px 0px 0px 0px`)
const shouldShrinkHeader = ref(false)
const shrinkHeader = computed(() => display.lgAndDown.value && shouldShrinkHeader.value)
function onIntersect(isIntersecting: boolean) {
  shouldShrinkHeader.value = !isIntersecting
}

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
  if (solutionCount.isLoading.value) return { limit, color: 'success' }
  return {
    limit: `${solutionCount.state.value}/${limit}`,
    color:
      solutionCount.state.value >= limit
        ? 'error'
        : solutionCount.state.value >= Math.max(1, limit - 2)
          ? 'warning'
          : 'success'
  }
})

watch(
  () => props.problemId,
  () => {
    problem.execute()
    solutionCount.execute()
  }
)

const { execute } = useContestAction()
</script>

<style module>
.header {
  position: sticky;
  top: v-bind(layout.mainRect.value.top + 'px');
  z-index: 1;
}
</style>

<i18n global>
  en:
    jump-to-problem: Jump to problem
    score: 'Score: {score}'
    solution-count-limit: 'Solution count limit: {limit}'
  zh-Hans:
    jump-to-problem: 跳转到题目页面
    score: 分数：{score}
    solution-count-limit: 提交次数限制：{limit}
  </i18n>
