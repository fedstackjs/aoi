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
    <template v-slot:[`item.state`]="{ item }">
      <SolutionStateChip :state="item.raw.state" />
    </template>
    <template v-slot:[`item.userId`]="{ item }">
      <PrincipalProfile :principal-id="item.raw.userId" />
    </template>
    <template v-slot:[`item.title`]="{ item }">
      <RouterLink :to="rel(item.raw)" style="color: primary">
        {{ item.raw.problemTitle }}
      </RouterLink>
    </template>
    <template v-slot:[`item.status`]="{ item }">
      <SolutionStatusChip :status="item.raw.status" :to="rel(item.raw)" />
    </template>
    <template v-slot:[`item.score`]="{ item }">
      <SolutionScoreDisplay :score="item.raw.score" :to="rel(item.raw)" />
    </template>
    <template v-slot:[`item.submittedAt`]="{ item }">
      <code>{{ getDate(item.raw.submittedAt) }}</code>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { VDataTableServer } from 'vuetify/labs/components'
import SolutionStateChip from '@/components/solution/SolutionStateChip.vue'
import PrincipalProfile from '@/components/utils/PrincipalProfile.vue'
import SolutionScoreDisplay from '../SolutionScoreDisplay.vue'
import SolutionStatusChip from '../SolutionStatusChip.vue'
import { usePagination } from '@/utils/pagination'
import { computed, ref } from 'vue'
import { useAppState } from '@/stores/app'

const { t } = useI18n()
const app = useAppState()

const props = defineProps<{
  orgId: string
  selfOnly?: boolean
}>()

const headers = [
  { title: t('term.state'), key: 'state', align: 'start', sortable: false },
  { title: t('term.user'), key: 'userId', align: 'start', sortable: false },
  { title: t('term.title'), key: 'title', align: 'start', sortable: false },
  { title: t('term.status'), key: 'status', align: 'start', sortable: false },
  { title: t('term.score'), key: 'score', align: 'center', sortable: false },
  { title: t('common.submitted-at'), key: 'submittedAt', align: 'start', sortable: false }
] as const

const userId = ref(app.userId as string)

const {
  page,
  itemsPerPage,
  result: submissions
} = usePagination(
  'solution',
  computed(() => {
    const query = {
      orgId: props.orgId,
      userId: userId.value
    }
    return query
  })
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rel = (item: any) => {
  const isContest = item.contestId ? true : false
  const parentId = (isContest ? item.contestId : item.problemId) as string
  const _id = item._id as string
  return isContest
    ? `/org/${props.orgId}/contest/${parentId}/solution/${_id}`
    : `/org/${props.orgId}/problem/${parentId}/solution/${_id}`
}

const getDate = (d: number) => new Date(d).toLocaleString()
</script>
<i18n>
en:
  submission-message: Message
zh-Hans:
  submission-message: 评测消息
</i18n>
