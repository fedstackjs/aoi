<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.contests')">
          <VDataTableServer
            :headers="headers"
            :items-length="contests.state.value.total"
            :items="contests.state.value.items"
            :items-per-page="15"
            :items-per-page-options="[{ title: '15', value: 15 }]"
            :loading="contests.isLoading.value"
            item-value="name"
            @update:options="({ page, itemsPerPage }) => contests.execute(0, page, itemsPerPage)"
          >
            <template v-slot:[`item._id`]="{ item }">
              <code>{{ item.raw._id }}</code>
            </template>
            <template v-slot:[`item.name`]="{ item }">
              <RouterLink :to="`/org/${orgId}/contest/${item.raw._id}`">
                {{ item.raw.title }}
              </RouterLink>
            </template>
          </VDataTableServer>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { VDataTableServer } from 'vuetify/labs/components'
import { http } from '@/utils/http'
import { withTitle } from '@/utils/title'
import { useAsyncState } from '@vueuse/core'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.contests')))

const headers = [
  { title: t('term.name'), key: 'name', align: 'start', sortable: false },
  { title: '#', key: '_id' }
] as const

const contests = useAsyncState(
  async (page = 1, itemsPerPage = 15) => {
    const resp = await http.get(`contest`, {
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
