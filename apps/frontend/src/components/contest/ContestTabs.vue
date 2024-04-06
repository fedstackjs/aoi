<template>
  <VTabs align-tabs="title" class="u-min-w-64">
    <VTab class="text-none" selected-class="" color="" :to="rel('')" :text="contest?.title ?? ''" />
    <VSlideYReverseTransition>
      <div class="u-self-center u-flex u-gap-2" v-if="contest && !headerVisible">
        <VChip color="success" v-if="registered" :text="t('msg.registered')" />
        <VChip color="info" v-else :text="t('msg.not-registered')" />
        <ContestStageChip :stages="contest.stages" :now="+now" />
      </div>
    </VSlideYReverseTransition>
  </VTabs>
  <VSpacer class="u-min-w-4" />
  <VTabs align-tabs="end">
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
import { useNow } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

import ContestStageChip from './ContestStageChip.vue'

import type { IContestDTO } from '@/components/contest/types'

const { t } = useI18n()
const props = defineProps<{
  orgId: string
  contestId: string
  showAdminTab: boolean
  registered: boolean
  contest: IContestDTO
  headerVisible: boolean
}>()

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/${to}`
const now = useNow()
</script>
