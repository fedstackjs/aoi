<template>
  <VDataTableServer
    :headers="headers"
    :items-length="announcements.state.value.total"
    :items="announcements.state.value.items"
    :items-per-page-options="[15, 30, 50, 100]"
    :loading="announcements.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => announcements.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item.title`]="{ item }">
      <RouterLink :to="`/announcement/${item._id}`">
        {{ item.title }}
      </RouterLink>
    </template>
    <template v-slot:[`item.date`]="{ item }">
      <code>{{ fmtDate(item.date) }}</code>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePagination } from '@/utils/pagination'
import { fmtDate } from './fmtdate'

const { t } = useI18n()

withTitle(computed(() => t('pages.announcements')))

const headers = [
  { title: t('term.title'), key: 'title', sortable: false },
  { title: t('term.date'), key: 'date', sortable: false }
] as const

const {
  page,
  itemsPerPage,
  result: announcements
} = usePagination<{
  _id: string
  title: string
  date: string
}>(`announcement`, {})
</script>
