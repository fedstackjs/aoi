<template>
  <VToolbar>
    <VToolbarTitle>{{ t('tabs.solutions') }}</VToolbarTitle>
    <VSpacer />
    <SolutionFilter
      :mode="mode"
      :org-id="orgId"
      :self-only="selfOnly"
      v-model:user-id="filter.userId.value"
      v-model:contest-id="filter.contestId.value"
      v-model:problem-id="filter.problemId.value"
      v-model:state="filter.state.value"
      v-model:status="filter.status.value"
      v-model:submitted-at-l="filter.submittedAtL.value"
      v-model:submitted-at-r="filter.submittedAtR.value"
      v-model:score-l="filter.scoreL.value"
      v-model:score-r="filter.scoreR.value"
    />
    <template v-if="!selfOnly">
      <VBtn :text="t('common.all')" @click="filter.userId.value = ''" :active="isAll" />
      <VBtn :text="t('common.self')" @click="filter.userId.value = app.userId" :active="isSelf" />
    </template>
  </VToolbar>
  <VDataTableServer
    :headers="headers"
    :items-length="submissions.state.value.total"
    :items="items"
    :items-per-page-options="[15, 30, 50, 100]"
    :loading="submissions.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => submissions.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item.state`]="{ item }">
      <SolutionStateChip :state="item.state" @click.right="filter.state.value = '' + item.state" />
    </template>
    <template v-slot:[`item.userId`]="{ item }">
      <PrincipalProfile :principal-id="item.userId" />
    </template>
    <template v-slot:[`item.problemTitle`]="{ item }">
      <RouterLink :to="item.problemUrl" class="text-primary">
        {{ item.problemTitle }}
      </RouterLink>
    </template>
    <template v-slot:[`item.contestTitle`]="{ item }">
      <component :is="item.contestUrl ? RouterLink : 'span'" :to="item.contestUrl">
        {{ item.contestTitle }}
      </component>
    </template>
    <template v-slot:[`item.status`]="{ item }">
      <SolutionStatusChip
        v-if="item.status"
        :status="item.status"
        :to="item.solutionUrl"
        @click.right="filter.status.value = item.status"
      />
      <span v-else>-</span>
    </template>
    <template v-slot:[`item.score`]="{ item }">
      <SolutionScoreDisplay :score="item.score" :to="item.solutionUrl" />
    </template>
    <template v-slot:[`item.submittedAt`]="{ item }">
      <code>{{ item.submittedAtStr }}</code>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import PrincipalProfile from '../utils/PrincipalProfile.vue'

import SolutionFilter from './SolutionFilter.vue'
import { useSolutionList } from './SolutionList'
import SolutionScoreDisplay from './SolutionScoreDisplay.vue'
import SolutionStatusChip from './SolutionStatusChip.vue'

import SolutionStateChip from '@/components/solution/SolutionStateChip.vue'
import { useAppState } from '@/stores/app'

const { t } = useI18n()
const app = useAppState()

const props = defineProps<{
  orgId: string
  problemId?: string
  contestId?: string
  selfOnly?: boolean
}>()

const { filter, mode, headers, page, itemsPerPage, submissions, items, isSelf, isAll } =
  useSolutionList(props)
</script>
<i18n>
en:
  submission-message: Message
zh-Hans:
  submission-message: 评测消息
</i18n>
