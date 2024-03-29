<template>
  <VDataTableServer
    :headers="headers"
    :items-length="problems.state.value.total"
    :items="problems.state.value.items"
    :items-per-page-options="[15, 30, 50, 100]"
    :loading="problems.isLoading.value"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    item-value="_id"
    @update:options="({ page, itemsPerPage }) => problems.execute(0, page, itemsPerPage)"
  >
    <template v-slot:[`item.title`]="{ item }">
      <div class="u-flex u-items-center u-gap-2">
        <RouterLink :to="`/org/${orgId}/problem/${item._id}`" class="u-flex u-gap-2">
          <div>
            <div>
              {{ item.title }}
            </div>
            <div class="u-text-xs text-secondary">
              <code>{{ item.slug }}</code>
            </div>
          </div>
        </RouterLink>
        <ProblemStatus :org-id="orgId" :problem-id="item._id" :status="item.status" />
      </div>
    </template>
    <template v-slot:[`item.accessLevel`]="{ item }">
      <AccessLevelBadge variant="chip" :access-level="item.accessLevel" inline />
    </template>
    <template v-slot:[`item.tags`]="{ item }">
      <ProblemTagGroup :tags="item.tags" :url-prefix="`/org/${orgId}/problem/tag`" />
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AccessLevelBadge from '../utils/AccessLevelBadge.vue'

import ProblemStatus from './ProblemStatus.vue'
import ProblemTagGroup from './ProblemTagGroup.vue'
import type { IProblemDTO } from './types'

import { usePagination } from '@/utils/pagination'
import { withTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
  search?: string
  tag?: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.problems')))

const headers = [
  { title: t('term.name'), key: 'title', sortable: false },
  { title: t('term.tags'), key: 'tags', sortable: false },
  { title: t('term.access-level'), key: 'accessLevel', align: 'end', sortable: false }
] as const

const {
  page,
  itemsPerPage,
  result: problems
} = usePagination<IProblemDTO>(
  `problem`,
  computed(() => JSON.parse(JSON.stringify(props)))
)

watch(
  () => props,
  () => problems.execute(0, (page.value = 1), itemsPerPage.value),
  { deep: true }
)
</script>
