<template>
  <VDataTableServer
    :headers="headers"
    :items-length="submissions.state.value.total"
    :items="submissions.state.value.items"
    :items-per-page="15"
    :items-per-page-options="[{ title: '15', value: 15 }]"
    :loading="submissions.isLoading.value"
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
      <code :color="palette(item.raw.score)">{{ item.raw.status }}</code>
    </template>
    <template v-slot:[`item.score`]="{ item }">
      <code :color="palette(item.raw.score)">{{ item.raw.score }}</code>
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
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { VDataTableServer } from 'vuetify/labs/components'
import SolutionStateChip from '@/components/solution/SolutionStateChip.vue'
import PrincipalProfile from '../utils/PrincipalProfile.vue'

const { t } = useI18n()

const props = defineProps<{
  orgId: string
  problemId?: string
  contestId?: string
}>()

const headers = [
  { title: t('term.id'), key: '_id', align: 'start', sortable: false },
  { title: t('term.user'), key: 'userId', align: 'start', sortable: false },
  { title: t('term.state'), key: 'state', align: 'start', sortable: false },
  { title: t('term.status'), key: 'status', align: 'start', sortable: false },
  { title: t('term.score'), key: 'score', sortable: false },
  { title: t('submission-message'), key: 'message', sortable: false }
] as const

const palette = (score: number) => {
  // interpolation between red and green
  const t = score / 100
  return '#' + Math.floor(t * 0x0000ff + (1 - t) * 0xff0000).toString(16)
}

const submissions = useAsyncState(
  async (page = 1, itemsPerPage = 15) => {
    const url = props.contestId
      ? `contest/${props.contestId}/solution`
      : `problem/${props.problemId}/solution`
    const resp = await http.get(url, {
      searchParams: {
        orgId: props.orgId,
        page: page,
        perPage: itemsPerPage,
        count: true
      }
    })

    return resp.json<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: any[]
      total: number
    }>()
  },
  { items: [], total: 0 }
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
