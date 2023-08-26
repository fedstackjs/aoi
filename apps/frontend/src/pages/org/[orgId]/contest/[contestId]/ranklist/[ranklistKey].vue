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
        <component :is="JsonViewer<Ranklist>" :endpoint="endpoint">
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
      </VWindowItem>
      <VWindowItem value="settings">
        <RanklistSettings
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
import type { IContestDTO } from '@/components/contest/types'
import { useI18n } from 'vue-i18n'
import JsonViewer from '@/components/utils/JsonViewer.vue'
import type { Ranklist } from '@aoi-js/common'
import { renderMarkdown } from '@/utils/md'
import PrincipalProfile from '@/components/utils/PrincipalProfile.vue'
import RanklistSettings from '@/components/contest/RanklistSettings.vue'
import { ref } from 'vue'
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

const endpoint = `contest/${props.contestId}/ranklist/${props.ranklistKey}/url`
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
