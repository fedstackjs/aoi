<template>
  <VTabs align-tabs="center" class="u-flex-1">
    <VTab prepend-icon="mdi-book-outline" exact :to="rel('')" :text="t('tabs.description')" />
    <VTab prepend-icon="mdi-attachment" :to="rel('attachment')" :text="t('tabs.attachments')" />
    <VTab
      v-show="showAdminTab || (contest?.currentStage.settings.problemEnabled && registered)"
      prepend-icon="mdi-list-box-outline"
      :to="rel('problem')"
      :text="t('tabs.problems')"
    />
    <VTab
      v-show="showAdminTab || (contest?.currentStage.settings.solutionEnabled && registered)"
      prepend-icon="mdi-timer-sand"
      :to="rel('solution')"
      :text="t('tabs.solutions')"
    />
    <VTab
      v-show="showAdminTab || contest?.currentStage.settings.ranklistEnabled"
      prepend-icon="mdi-chevron-triple-up"
      :to="rel('ranklist')"
      :text="t('tabs.ranklist')"
    />
    <VTab
      v-show="showAdminTab || contest?.currentStage.settings.participantEnabled"
      prepend-icon="mdi-account-details-outline"
      :to="rel('participant')"
      :text="t('tabs.participant')"
    />
    <VTab
      v-show="showAdminTab"
      prepend-icon="mdi-cog-outline"
      :to="rel('admin')"
      :text="t('tabs.management')"
    />
  </VTabs>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { IContestDTO } from '@/components/contest/types'
import { useAppState } from '@/stores/app'

const { t } = useI18n()
const app = useAppState()
const props = defineProps<{
  orgId: string
  contestId: string
  showAdminTab: boolean
  registered: boolean
  contest: IContestDTO
}>()

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/${to}`
</script>
