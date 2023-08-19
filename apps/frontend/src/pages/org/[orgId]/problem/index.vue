<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('problems')">
          <VDataTableServer
            :headers="headers"
            :items-length="problems.state.value.total"
            :items="problems.state.value.items"
            :items-per-page="15"
            :items-per-page-options="[{ title: '15', value: 15 }]"
            :loading="problems.isLoading.value"
            item-value="_id"
            @update:options="({ page, itemsPerPage }) => problems.execute(0, page, itemsPerPage)"
          >
            <template v-slot:[`item.slug`]="{ item }">
              <code>{{ item.raw.slug }}</code>
            </template>
            <template v-slot:[`item.title`]="{ item }">
              <RouterLink :to="`/org/${orgId}/problem/${item.raw._id}`">
                {{ item.raw.title }}
              </RouterLink>
            </template>
            <template v-slot:[`item.tags`]="{ item }">
              <VChip v-for="tag in item.raw.tags" :key="tag" class="mx-1">
                {{ tag }}
              </VChip>
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
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { VDataTableServer } from 'vuetify/labs/components'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('problems')))

const headers = [
  { title: t('term.slug'), key: 'slug', align: 'start' },
  { title: t('term.problem-name'), key: 'title' },
  { title: t('term.tags'), key: 'tags', sortable: false },
  { title: '#', key: '_id' }
] as const

const problems = useAsyncState(
  async (page = 1, itemsPerPage = 15) => {
    const resp = await http.get(`problem`, {
      searchParams: {
        orgId: props.orgId,
        page: page,
        perPage: itemsPerPage,
        count: true
      }
    })

    return resp.json<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: any[]
      total: number
    }>()
  },
  { items: [], total: 0 }
)
</script>
