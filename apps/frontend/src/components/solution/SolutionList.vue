<template>
  <VToolbar>
    <VToolbarTitle>{{ t('tabs.solutions') }}</VToolbarTitle>
    <VSpacer />
    <VBtn v-if="!selfOnly" :text="t('common.all')" @click="userId = ''" />
    <VBtn :text="t('common.self')" @click="userId = app.userId" />
  </VToolbar>
  <VDataTableServer
    :headers="headers"
    :items-length="submissions.state.value.total"
    :items="submissions.state.value.items"
    :items-per-page-options="[{ title: '15', value: 15 }]"
    :loading="submissions.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => submissions.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item._id`]="{ item }">
      <RouterLink :to="rel(item.raw._id)">
        <code>{{ item.raw._id }}</code>
      </RouterLink>
    </template>
    <template v-slot:[`item.userId`]="{ item }">
      <PrincipalProfile :principal-id="item.raw.userId" />
    </template>
    <template v-slot:[`item.state`]="{ item }">
      <SolutionStateChip :state="item.raw.state" />
    </template>
    <template v-slot:[`item.status`]="{ item }">
      <SolutionStatusChip :status="item.raw.status" />
    </template>
    <template v-slot:[`item.score`]="{ item }">
      <SolutionScoreDisplay :score="item.raw.score" />
    </template>
    <template v-slot:[`item.message`]="{ item }">
      <code>{{ item.raw.message }}</code>
    </template>
    <template v-slot:[`item.submittedAt`]="{ item }">
      <code>{{ item.raw.submittedAt }}</code>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { VDataTableServer } from 'vuetify/labs/components'
import SolutionStateChip from '@/components/solution/SolutionStateChip.vue'
import PrincipalProfile from '../utils/PrincipalProfile.vue'
import SolutionScoreDisplay from './SolutionScoreDisplay.vue'
import SolutionStatusChip from './SolutionStatusChip.vue'
import { usePagination } from '@/utils/pagination'
import { useRouteQuery } from '@vueuse/router'
import { computed } from 'vue'
import { useAppState } from '@/stores/app'

const { t } = useI18n()
const app = useAppState()

const props = defineProps<{
  orgId: string
  problemId?: string
  contestId?: string
  selfOnly?: boolean
}>()

const headers = [
  { title: t('term.id'), key: '_id', align: 'start', sortable: false },
  { title: t('term.user'), key: 'userId', align: 'start', sortable: false },
  { title: t('term.state'), key: 'state', align: 'start', sortable: false },
  { title: t('term.status'), key: 'status', align: 'start', sortable: false },
  { title: t('term.score'), key: 'score', sortable: false },
  { title: t('submission-message'), key: 'message', sortable: false }
] as const

const userId = useRouteQuery('userId')

const {
  page,
  itemsPerPage,
  result: submissions
} = usePagination(
  props.contestId ? `contest/${props.contestId}/solution` : `problem/${props.problemId}/solution`,
  computed(() => (userId.value ? { userId: userId.value } : {}))
)

const rel = (to: string) =>
  props.contestId
    ? `/org/${props.orgId}/contest/${props.contestId}/solution/${to}`
    : `/org/${props.orgId}/problem/${props.problemId}/solution/${to}`
</script>
<i18n>
en:
  submission-message: Message
zh-Hans:
  submission-message: 评测消息
</i18n>
