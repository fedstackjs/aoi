<template>
  <VCard color="grey-lighten-4">
    <VToolbar dark color="grey-lighten-2">
      <VBtn icon="mdi-balloon" variant="plain" />
      <VToolbarTitle>
        {{ t(`${orgId ? 'org' : 'global'}-recent-contests`) }}
      </VToolbarTitle>
    </VToolbar>
    <VCardText>
      <VTable class="bg-grey-lighten-4">
        <thead>
          <tr>
            <th class="text-subtitle-1">{{ t('term.slug') }}</th>
            <th class="text-subtitle-1">{{ t('term.title') }}</th>
            <th class="text-subtitle-1">{{ t('term.stage') }}</th>
          </tr>
        </thead>
        <tbody>
          <AsyncState :state="contests" hide-when-loading>
            <template v-slot="{ value }">
              <tr v-for="(item, i) in value.items" :key="i">
                <td class="text-body-1">{{ item.slug }}</td>
                <td class="text-body-1">
                  <RouterLink :to="`/org/${orgId ?? item.orgId}/contest/${item._id}`">
                    {{ item.title }}
                  </RouterLink>
                </td>
                <td class="text-body-1">
                  <ContestStageChip :stages="item.stages" :now="now" />
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

import ContestStageChip from '@/components/contest/ContestStageChip.vue'
import AsyncState from '@/components/utils/AsyncState.vue'
import { http } from '@/utils/http'

const { t } = useI18n()

const props = defineProps<{ orgId?: string }>()
const now = +new Date()

const contests = useAsyncState(
  async () => {
    const endpoint = props.orgId ? `contest` : `contest/public`
    const resp = await http.get(endpoint, {
      searchParams: {
        orgId: props.orgId ?? '',
        page: 1,
        perPage: 15,
        count: false
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

<i18n>
en:
  global-recent-contests: Global Recent contests
  org-recent-contests: Organization Recent contests 
zh-Hans:
  global-recent-contests: 全站近期比赛
  org-recent-contests: 组织近期比赛
</i18n>
