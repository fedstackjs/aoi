<template>
  <VCard variant="flat">
    <VTabs v-model="currentTab">
      <VTab value="show">
        {{ t('ranklist-show') }}
      </VTab>
      <VTab v-if="admin" value="settings" prepend-icon="mdi-cog-outline">
        {{ t('ranklist-settings') }}
      </VTab>
    </VTabs>
    <VWindow v-model="currentTab">
      <VWindowItem value="show">
        <RanklistViewer :endpoint="endpoint" />
      </VWindowItem>
      <VWindowItem value="settings">
        <RanklistSettings
          :key="props.ranklistKey"
          :ranklist-key="props.ranklistKey"
          :org-id="props.orgId"
          :contest-id="props.contestId"
          @updated="emit('updated')"
        />
      </VWindowItem>
    </VWindow>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import RanklistSettings from '@/components/contest/RanklistSettings.vue'
import RanklistViewer from '@/components/contest/RanklistViewer.vue'
import type { IContestDTO } from '@/components/contest/types'
import { useContestCapability } from '@/utils/contest/inject'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  ranklistKey: string
  ranklists: [{ key: string; name: string }]
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const currentTab = ref()
const admin = useContestCapability('admin')

const endpoint = computed(
  () => `contest/${props.contestId}/ranklist/${encodeURIComponent(props.ranklistKey)}/url`
)
</script>

<i18n>
en:
  ranklist-settings: Ranklist Settings
  ranklist-show: Ranklist Details
  ranklist-waiting-in-progress: Generating ranklist, please refresh the page later.
zh-Hans:
  ranklist-settings: 设置
  ranklist-show: 排行榜
  ranklist-waiting-in-progress: 正在生成排行榜，请稍后刷新页面。
</i18n>
