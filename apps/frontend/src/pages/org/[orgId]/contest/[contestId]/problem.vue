<template>
  <AsyncState :state="problems" hide-when-loading>
    <template v-slot="{ value }">
      <VRow>
        <VCol cols="auto">
          <VTabs direction="vertical" color="primary" :class="$style.tabs">
            <VTab v-if="enableOverview" prepend-icon="mdi-home" :to="rel('')" exact>
              {{ t('term.overview') }}
            </VTab>
            <VTab
              v-for="problem of value"
              :key="problem._id"
              :to="rel(problem._id)"
              prepend-icon="mdi-list-box-outline"
              class="text-none"
            >
              {{ problem.settings.slug }}.
              {{ problem.title }}
            </VTab>
            <VTab prepend-icon="mdi-plus" :to="rel('new')" v-if="admin">
              {{ t('action.new') }}
            </VTab>
          </VTabs>
        </VCol>
        <VCol>
          <RouterView
            class="flex-grow-1"
            :contest="contest"
            :problems="value"
            @updated="problems.execute()"
          />
        </VCol>
      </VRow>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import type { UseAsyncStateReturn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useLayout } from 'vuetify'

import type { IContestDTO, IContestProblemListDTO } from '@/components/contest/types'
import AsyncState from '@/components/utils/AsyncState.vue'
import { useContestCapability } from '@/utils/contest/inject'
import { enableOverview } from '@/utils/flags'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  problems: UseAsyncStateReturn<IContestProblemListDTO[], [], true>
}>()

const { t } = useI18n()
const admin = useContestCapability('admin')
const layout = useLayout()

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/problem/${to}`
</script>

<style module>
.tabs {
  position: sticky;
  top: v-bind(layout.mainRect.value.top + 16 + 'px');
}
</style>
