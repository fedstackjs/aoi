<template>
  <VDataTableServer
    :headers="headers"
    :items-length="participants.state.value.total"
    :items="participants.state.value.items"
    :items-per-page-options="[{ title: '15', value: 15 }]"
    :loading="participants.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => participants.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item.userId`]="{ item }">
      <PrincipalProfile :to="admin ? rel(item.raw.userId) : ''" :principal-id="item.raw.userId" />
    </template>
    <template v-slot:[`item.tags`]="{ item }">
      <VChipGroup>
        <VChip v-for="tag in item.raw.tags" :key="tag">
          {{ tag }}
        </VChip>
      </VChipGroup>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/components'
import { useI18n } from 'vue-i18n'
import type { IContestDTO } from '@/components/contest/types'
import { useContestCapability } from '@/utils/contest/inject'
import { usePagination } from '@/utils/pagination'
import PrincipalProfile from '@/components/utils/PrincipalProfile.vue'

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
} = usePagination(`contest/${props.contestId}/participant`, {})

const headers = [
  { title: t('term.user'), key: 'userId', align: 'start', sortable: false },
  { title: t('term.tags'), key: 'tags', align: 'start', sortable: false }
] as const

const rel = (path: string) => `/org/${props.orgId}/contest/${props.contestId}/participant/${path}`
</script>
