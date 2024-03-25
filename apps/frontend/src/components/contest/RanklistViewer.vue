<template>
  <component :is="JsonViewer<Ranklist>" :endpoint="props.endpoint" hide-raw>
    <template v-slot="{ value }">
      <RanklistRenderer :ranklist="value" />
    </template>
    <template #error="{}">
      <VAlert type="info" :text="t('ranklist-waiting-in-progress')" />
    </template>
  </component>
</template>

<script setup lang="ts">
import type { Ranklist } from '@aoi-js/common'
import { useI18n } from 'vue-i18n'

import RanklistRenderer from '../contest/RanklistRenderer.vue'

import JsonViewer from '@/components/utils/JsonViewer.vue'

const { t } = useI18n()
const props = defineProps<{
  endpoint: string
}>()
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
