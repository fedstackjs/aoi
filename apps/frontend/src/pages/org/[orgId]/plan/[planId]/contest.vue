<template>
  <AsyncState :state="contests">
    <template v-slot="{ value }">
      <div class="d-flex flex-row">
        <VTabs direction="vertical" color="primary">
          <VTab prepend-icon="mdi-home" :to="rel('')" exact>
            {{ t('overview') }}
          </VTab>
          <VTab
            v-for="contest of value"
            :key="contest._id"
            prepend-icon="mdi-list-box-outline"
            :to="rel(contest._id)"
            exact
          >
            {{ contest.title }}
          </VTab>
          <VTab prepend-icon="mdi-plus" :to="rel('new')">
            {{ t('new') }}
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
import AsyncState from '@/components/utils/AsyncState.vue'
import type { IPlanDTO, IPlanContestDTO } from '@/components/plan/types'
import { http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
}>()

const { t } = useI18n()

const contests = useAsyncState(async () => {
  const resp = await http.get(`plan/${props.planId}/contest`)
  const data = await resp.json<IPlanContestDTO[]>()
  return data
}, [])

const rel = (to: string) => `/org/${props.orgId}/plan/${props.planId}/contest/${to}`
</script>
