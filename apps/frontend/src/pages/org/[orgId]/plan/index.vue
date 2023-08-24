<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.plans')">
          <VDataTableServer
            :headers="headers"
            :items-length="plans.state.value.total"
            :items="plans.state.value.items"
            :items-per-page="15"
            :items-per-page-options="[{ title: '15', value: 15 }]"
            :loading="plans.isLoading.value"
            item-value="name"
            @update:options="({ page, itemsPerPage }) => plans.execute(0, page, itemsPerPage)"
          >
            <template v-slot:[`item._id`]="{ item }">
              <code>{{ item.raw._id }}</code>
            </template>
            <template v-slot:[`item.name`]="{ item }">
              <RouterLink :to="`/org/${orgId}/plan/${item.raw._id}`">
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

withTitle(computed(() => t('pages.plans')))

const headers = [
  { title: t('term.name'), key: 'name', align: 'start', sortable: false },
  { title: t('term.id'), key: '_id' }
] as const

const plans = useAsyncState(
  async (page = 1, itemsPerPage = 15) => {
    const resp = await http.get(`plan`, {
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
