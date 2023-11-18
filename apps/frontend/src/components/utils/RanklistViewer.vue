<template>
  <component :is="JsonViewer<Ranklist>" :endpoint="props.endpoint">
    <template v-slot="{ value }">
      <VCard flat>
        <!-- Topstar -->
        <!-- TODO -->
      </VCard>
      <VDivider />
      <VCard flat>
        <!-- participants -->
        <VTable>
          <thead>
            <th>{{ t('term.rank') }}</th>
            <th>{{ t('term.participant') }}</th>
            <th v-for="(header, i) in value.participant.columns" :key="i">
              {{ header.name }}
            </th>
          </thead>
          <tbody>
            <tr v-for="(man, i) in value.participant.list" :key="i">
              <td>{{ man.rank }}</td>
              <td><PrincipalProfile :principal-id="man.userId" /></td>
              <td v-for="(column, i) in man.columns" :key="i">
                <article v-html="renderMarkdown(column.content)"></article>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </template>
    <template #error="{}">
      <VAlert type="info" :text="t('ranklist-waiting-in-progress')" />
    </template>
  </component>
</template>

<script setup lang="ts">
import JsonViewer from '@/components/utils/JsonViewer.vue'
import type { Ranklist } from '@aoi-js/common'
import { renderMarkdown } from '@/utils/md'
import PrincipalProfile from '@/components/utils/PrincipalProfile.vue'
import { useI18n } from 'vue-i18n'

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
