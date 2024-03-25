<template>
  <VCard color="grey-lighten-4">
    <VToolbar dark color="grey-lighten-2">
      <VBtn icon="mdi-rss" variant="plain" />
      <VToolbarTitle>
        {{ t('pages.announcements') }}
      </VToolbarTitle>
    </VToolbar>
    <VCardText>
      <VTable class="bg-grey-lighten-4">
        <thead>
          <tr>
            <th class="text-subtitle-1">{{ t('term.title') }}</th>
            <th class="text-subtitle-1">{{ t('term.date') }}</th>
          </tr>
        </thead>
        <tbody>
          <AsyncState :state="announcements" hide-when-loading>
            <template v-slot="{ value }">
              <tr v-for="(item, i) in value.items" :key="i">
                <td class="text-body-1">
                  <RouterLink :to="`/announcement/${item._id}`">
                    {{ item.title }}
                  </RouterLink>
                </td>
                <td class="text-body-1">
                  {{ fmtDate(item.date) }}
                </td>
              </tr>
            </template>
          </AsyncState>
        </tbody>
      </VTable>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

import { fmtDate } from '@/components/announcement/fmtdate'
import AsyncState from '@/components/utils/AsyncState.vue'
import { http } from '@/utils/http'

const { t } = useI18n()

const props = defineProps<{ orgId?: string }>()

const announcements = useAsyncState(
  async () => {
    // TODO: api implementation
    // global when orgId is not provided
    const resp = await http.get(`announcement`, {
      searchParams: {
        page: 1,
        perPage: 15,
        count: true,
        orgId: props.orgId ?? ''
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
