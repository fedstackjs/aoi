<template>
  <AsyncState :state="ranklists" hide-when-loading>
    <template v-slot="{ value }">
      <VRow>
        <VCol cols="auto">
          <VTabs direction="vertical" color="primary">
            <VTab v-if="enableOverview" prepend-icon="mdi-home" :to="rel('')" exact>
              {{ t('term.overview') }}
            </VTab>
            <VTab
              v-for="ranklist in value"
              :key="ranklist.key"
              prepend-icon="mdi-list-box-outline"
              :to="rel(encodeURIComponent(ranklist.key))"
              exact
            >
              {{ ranklist.name }}
            </VTab>
            <VTab prepend-icon="mdi-plus" :to="rel('new')" exact v-if="admin">
              {{ t('action.new') }}
            </VTab>
          </VTabs>
        </VCol>
        <VCol>
          <RouterView
            class="flex-grow-1"
            :contest="contest"
            :ranklists="value"
            @updated="ranklists.execute()"
          />
        </VCol>
      </VRow>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

import type { IContestDTO } from '@/components/contest/types'
import AsyncState from '@/components/utils/AsyncState.vue'
import { useContestCapability } from '@/utils/contest/inject'
import { enableOverview } from '@/utils/flags'
import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const { t } = useI18n()
const admin = useContestCapability('admin')

const ranklists = useAsyncState(async () => {
  const resp = await http.get(`contest/${props.contestId}/ranklist`)
  return await resp.json<[{ key: string; name: string }]>()
}, null as never)

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/ranklist/${to}`
</script>
