<template>
  <VDataTableServer
    :headers="headers"
    :items-length="participants.state.value.total"
    :items="participants.state.value.items"
    :items-per-page-options="perPageOptions"
    :loading="participants.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => participants.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item.userId`]="{ item }">
      <PrincipalProfile :to="admin ? rel(item.userId) : ''" :principal-id="item.userId" />
    </template>
    <template v-slot:[`item.tags`]="{ item }">
      <VChipGroup>
        <VChip v-for="tag in item.tags" :key="tag">
          {{ tag }}
        </VChip>
      </VChipGroup>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { IContestDTO } from '@/components/contest/types'
import PrincipalProfile from '@/components/utils/PrincipalProfile.vue'
import { useContestCapability } from '@/utils/contest/inject'
import { usePagination } from '@/utils/pagination'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const { t } = useI18n()
const admin = useContestCapability('admin')

const {
  page,
  itemsPerPage,
  result: participants
} = usePagination<{
  userId: string
  tags: string[]
}>(`contest/${props.contestId}/participant`, {})

const headers = [
  { title: t('term.user'), key: 'userId', align: 'start', sortable: false },
  { title: t('term.tags'), key: 'tags', align: 'start', sortable: false }
] as const

const perPageOptions = [
  { title: '15', value: 15 },
  { title: '30', value: 30 },
  { title: '50', value: 50 },
  { title: '100', value: 100 }
] as const

const rel = (path: string) => `/org/${props.orgId}/contest/${props.contestId}/participant/${path}`
</script>
