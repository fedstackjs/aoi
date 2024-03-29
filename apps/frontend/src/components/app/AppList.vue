<template>
  <VDataTableServer
    :headers="headers"
    :items-length="apps.state.value.total"
    :items="apps.state.value.items"
    :items-per-page-options="[15, 30, 50, 100]"
    :loading="apps.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => apps.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item.title`]="{ item }">
      <RouterLink :to="`/org/${orgId}/contest/${item._id}`">
        <div>
          <div>
            {{ item.title }}
          </div>
          <div class="u-text-xs text-secondary">
            <code>{{ item.slug }}</code>
          </div>
        </div>
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
    <template v-slot:[`item.accessLevel`]="{ item }">
      <AccessLevelBadge variant="chip" :access-level="item.accessLevel" inline />
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AccessLevelBadge from '../utils/AccessLevelBadge.vue'

import type { IAppDTO } from './types'

import { usePagination } from '@/utils/pagination'
import { withTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
  search?: string
  tag?: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.apps')))

const headers = [
  { title: t('term.name'), key: 'title', sortable: false },
  { title: t('term.tags'), key: 'tags', sortable: false },
  { title: t('term.access-level'), key: 'accessLevel', align: 'end', sortable: false }
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
