<template>
  <AsyncState :state="contests" hide-when-loading>
    <template v-slot="{ value }">
      <div class="d-flex flex-row">
        <VTabs direction="vertical" color="primary">
          <VTab v-if="enableOverview" prepend-icon="mdi-home" :to="rel('')" exact>
            {{ t('term.overview') }}
          </VTab>
          <VTab
            v-for="contest of value"
            :key="contest._id"
            :to="rel(contest._id)"
            class="text-none"
            prepend-icon="mdi-list-box-outline"
            exact
          >
            <span>
              {{ contest.settings.slug }}.
              {{ contest.title }}
            </span>
          </VTab>
          <VTab prepend-icon="mdi-plus" :to="rel('new')">
            {{ t('action.new') }}
          </VTab>
        </VTabs>
        <VDivider vertical />
        <RouterView
          class="flex-grow-1"
          :plan="plan"
          :contests="value"
          @updated="contests.execute()"
        />
      </div>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

import type { IPlanDTO, IPlanContestDTO } from '@/components/plan/types'
import AsyncState from '@/components/utils/AsyncState.vue'
import { enableOverview } from '@/utils/flags'
import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
}>()

const { t } = useI18n()

const contests = useAsyncState(async () => {
  const resp = await http.get(`plan/${props.planId}/contest`)
  const data = await resp.json<IPlanContestDTO[]>()
  return data.sort((a, b) => a.settings.slug.localeCompare(b.settings.slug))
}, [])

const rel = (to: string) => `/org/${props.orgId}/plan/${props.planId}/contest/${to}`
</script>
