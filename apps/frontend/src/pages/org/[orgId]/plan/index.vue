<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.plans')">
          <VDataTableServer
            :headers="headers"
            :items-length="plans.state.value.total"
            :items="plans.state.value.items"
            :items-per-page-options="[{ title: '15', value: 15 }]"
            :loading="plans.isLoading.value"
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            item-value="_id"
            @update:options="({ page, itemsPerPage }) => plans.execute(0, page, itemsPerPage)"
          >
            <template v-slot:[`item.slug`]="{ item }">
              <code>{{ item.raw.slug }}</code>
            </template>
            <template v-slot:[`item.title`]="{ item }">
              <RouterLink :to="`/org/${orgId}/plan/${item.raw._id}`">
                {{ item.raw.title }}
              </RouterLink>
            </template>
            <template v-slot:[`item.tags`]="{ item }">
              <VChipGroup>
                <VChip v-for="tag in item.raw.tags" :key="tag">
                  {{ tag }}
                </VChip>
              </VChipGroup>
            </template>
            <template v-slot:[`item._id`]="{ item }">
              <code>{{ item.raw._id }}</code>
            </template>
          </VDataTableServer>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/components'
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePagination } from '@/utils/pagination'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.plans')))

const headers = [
  { title: t('term.slug'), key: 'slug', align: 'start', sortable: false },
  { title: t('term.name'), key: 'title', sortable: false },
  { title: t('term.tags'), key: 'tags', sortable: false },
  { title: '#', key: '_id', sortable: false }
] as const

const {
  page,
  itemsPerPage,
  result: plans
} = usePagination(
  `plan`,
  computed(() => ({ orgId: props.orgId }))
)
</script>
