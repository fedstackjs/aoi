<template>
  <AsyncState :state="problems" hide-when-loading>
    <template v-slot="{ value }">
      <div class="d-flex flex-row">
        <VTabs direction="vertical" color="primary">
          <VTab v-if="enableOverview" prepend-icon="mdi-home" :to="rel('')" exact>
            {{ t('term.overview') }}
          </VTab>
          <VTab
            v-for="problem of value"
            :key="problem._id"
            prepend-icon="mdi-list-box-outline"
            :to="rel(problem._id)"
            exact
          >
            {{ problem.settings.slug }}.
            {{ problem.title }}
          </VTab>
          <VTab prepend-icon="mdi-plus" :to="rel('new')" v-if="admin">
            {{ t('action.new') }}
          </VTab>
        </VTabs>
        <VDivider vertical />
        <RouterView
          class="flex-grow-1"
          :contest="contest"
          :problems="value"
          @updated="problems.execute()"
        />
      </div>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import type { UseAsyncStateReturn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

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

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/problem/${to}`
</script>
