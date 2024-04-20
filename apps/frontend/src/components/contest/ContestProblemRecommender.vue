<template>
  <VDialog width="auto" max-width="640" min-width="640">
    <template v-slot:activator="{ props }">
      <VBtn
        color="info"
        prepend-icon="mdi-tag-arrow-right-outline"
        :text="t('action.recommend-problem')"
        v-bind="props"
      />
    </template>

    <VCard :title="t('action.recommend-problem')">
      <VCardText>
        <VTextField v-model="search" :label="t('term.search')" clearable />
        <VCombobox v-model="tags" :label="t('term.tags')" multiple chips />
        <VBtn
          block
          variant="flat"
          :text="t('action.recommend-problem')"
          @click="problems.execute()"
        />
      </VCardText>
      <VDivider />
      <VDataTable
        :headers="headers"
        :items="problems.state.value"
        :loading="problems.isLoading.value"
        item-value="_id"
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
        <template v-slot:[`item.actions`]="{ item }">
          <VBtn variant="tonal" @click="emit('update', item._id)" :text="t('action.select')" />
        </template>
      </VDataTable>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import ProblemStatus from '../problem/ProblemStatus.vue'
import ProblemTagGroup from '../problem/ProblemTagGroup.vue'
import type { IProblemDTO } from '../problem/types'
import AccessLevelBadge from '../utils/AccessLevelBadge.vue'

import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
}>()

const emit = defineEmits<{
  (ev: 'update', value: string): void
}>()

const { t } = useI18n()
const search = ref('')
const tags = ref<string[]>([])

const headers = [
  { title: t('term.name'), key: 'title', sortable: false },
  { title: t('term.tags'), key: 'tags', sortable: false },
  { title: t('term.access-level'), key: 'accessLevel', align: 'end', sortable: false },
  { title: t('term.actions'), key: 'actions', align: 'end', sortable: false }
] as const

const problems = useAsyncState(
  async () =>
    http
      .post('problem/recommend', {
        json: {
          orgId: props.orgId,
          search: search.value || undefined,
          tags: tags.value.length ? tags.value : undefined,
          sample: 10
        }
      })
      .json<IProblemDTO[]>(),
  [],
  { immediate: false, resetOnExecute: false }
)
</script>
