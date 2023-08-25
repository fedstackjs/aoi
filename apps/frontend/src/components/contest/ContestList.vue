<template>
  <VDataTableServer
    :headers="headers"
    :items-length="contests.state.value.total"
    :items="contests.state.value.items"
    :items-per-page-options="[{ title: '15', value: 15 }]"
    :loading="contests.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => contests.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item.slug`]="{ item }">
      <code>{{ item.raw.slug }}</code>
    </template>
    <template v-slot:[`item.title`]="{ item }">
      <RouterLink :to="`/org/${orgId}/contest/${item.raw._id}`">
        {{ item.raw.title }}
      </RouterLink>
    </template>
    <template v-slot:[`item.tags`]="{ item }">
      <VChipGroup>
        <VChip
          v-for="tag in item.raw.tags"
          :key="tag"
          :to="`/org/${orgId}/contest/tag/${encodeURIComponent(tag)}`"
        >
          {{ tag }}
        </VChip>
      </VChipGroup>
    </template>
    <template v-slot:[`item._id`]="{ item }">
      <code>{{ item.raw._id }}</code>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VDataTableServer } from 'vuetify/labs/components'
import { usePagination } from '@/utils/pagination'
import { watch } from 'vue'

const props = defineProps<{
  orgId: string
  search?: string
  tag?: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.contests')))

const headers = [
  { title: t('term.slug'), key: 'slug', align: 'start', sortable: false },
  { title: t('term.name'), key: 'title', sortable: false },
  { title: t('term.tags'), key: 'tags', sortable: false },
  { title: '#', key: '_id', sortable: false }
] as const

const {
  page,
  itemsPerPage,
  result: contests
} = usePagination(
  `contest`,
  computed(() => JSON.parse(JSON.stringify(props)))
)

watch(
  () => props,
  () => contests.execute(0, (page.value = 1), itemsPerPage.value),
  { deep: true }
)
</script>
