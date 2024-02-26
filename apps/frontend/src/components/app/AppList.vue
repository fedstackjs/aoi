<template>
  <VDataTableServer
    :headers="headers"
    :items-length="apps.state.value.total"
    :items="apps.state.value.items"
    :items-per-page-options="[{ title: '15', value: 15 }]"
    :loading="apps.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => apps.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item.slug`]="{ item }">
      <code>{{ item.slug }}</code>
    </template>
    <template v-slot:[`item.title`]="{ item }">
      <AccessLevelBadge :access-level="item.accessLevel" inline />
      <RouterLink :to="`/org/${orgId}/app/${item._id}`">
        {{ item.title }}
      </RouterLink>
    </template>
    <template v-slot:[`item.tags`]="{ item }">
      <VChipGroup>
        <VChip
          v-for="tag in item.tags"
          :key="tag"
          :to="`/org/${orgId}/app/tag/${encodeURIComponent(tag)}`"
        >
          {{ tag }}
        </VChip>
      </VChipGroup>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePagination } from '@/utils/pagination'
import { watch } from 'vue'
import type { IAppDTO } from './types'
import AccessLevelBadge from '../utils/AccessLevelBadge.vue'

const props = defineProps<{
  orgId: string
  search?: string
  tag?: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.apps')))

const headers = [
  { title: t('term.slug'), key: 'slug', align: 'start', sortable: false },
  { title: t('term.name'), key: 'title', sortable: false },
  { title: t('term.tags'), key: 'tags', sortable: false }
] as const

const {
  page,
  itemsPerPage,
  result: apps
} = usePagination<IAppDTO>(
  `app`,
  computed(() => props)
)

watch(
  () => props,
  () => apps.execute(0, (page.value = 1), itemsPerPage.value),
  { deep: true }
)
</script>
