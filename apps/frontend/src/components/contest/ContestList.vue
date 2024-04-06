<template>
  <VDataTableServer
    :headers="headers"
    :items-length="contests.state.value.total"
    :items="contests.state.value.items"
    :items-per-page-options="[15, 30, 50, 100]"
    :loading="contests.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => contests.execute(0, page, itemsPerPage)"
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
    <template v-slot:[`item.count`]="{ item }">
      <code>{{ item.participantCount }}</code>
    </template>
    <template v-slot:[`item.time`]="{ item }">
      <div>
        <div>
          {{ t('common.from') }}
          <b> {{ denseDateString(item.start) }}</b>
        </div>
        <div>
          {{ t('common.to') }}
          <b>{{ denseDateString(item.end) }}</b>
        </div>
      </div>
    </template>
    <template v-slot:[`item.stage`]="{ item }">
      <ContestStageChip :stages="item.stages" :now="now" />
    </template>
    <template v-slot:[`item.tags`]="{ item }">
      <VChipGroup>
        <VChip
          v-for="tag in item.tags"
          :key="tag"
          :to="`/org/${orgId}/contest/tag/${encodeURIComponent(tag)}`"
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

import ContestStageChip from './ContestStageChip.vue'
import type { IContestDTO } from './types'

import AccessLevelBadge from '@/components/utils/AccessLevelBadge.vue'
import { usePagination } from '@/utils/pagination'
import { denseDateString } from '@/utils/time'
import { withTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
  search?: string
  tag?: string
}>()

const { t } = useI18n()
const now = +new Date()

withTitle(computed(() => t('pages.contests')))

const headers = [
  { title: t('term.name'), key: 'title', sortable: false },
  { title: t('term.participant-count'), key: 'count', sortable: false },
  { title: t('term.contest-time'), key: 'time', sortable: false },
  { title: t('term.contest-stage'), key: 'stage', sortable: false },
  { title: t('term.tags'), key: 'tags', sortable: false },
  { title: t('term.access-level'), key: 'accessLevel', align: 'end', sortable: false }
] as const

const {
  page,
  itemsPerPage,
  result: contests
} = usePagination<IContestDTO & { participantCount: number }>(
  `contest`,
  computed(() => JSON.parse(JSON.stringify(props)))
)

watch(
  () => props,
  () => contests.execute(0, (page.value = 1), itemsPerPage.value),
  { deep: true }
)
</script>
