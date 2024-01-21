<template>
  <component :is="JsonViewer<Ranklist>" :endpoint="props.endpoint" hide-raw>
    <template v-slot="{ value }">
      <template v-if="value.topstar">
        <VCard flat>
          <!-- Topstar -->
          <RanklistTopstars :topstar="value.topstar" />
        </VCard>
        <VDivider />
      </template>
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
              <td class="u-flex u-items-center">
                <PrincipalProfile
                  :principal-id="man.userId"
                  :to="admin ? participantUrl(man.userId) : undefined"
                />
                <div v-if="man.tags" class="u-pl-2 u-flex u-items-center u-gap-2">
                  <div v-for="(tag, i) of man.tags" :key="i">
                    <VTooltip v-if="tag.startsWith('!star:')" :text="tag.slice(6)">
                      <template v-slot:activator="{ props }">
                        <VIcon color="warning" v-bind="props">mdi-star</VIcon>
                      </template>
                    </VTooltip>
                    <VChip v-else>{{ tag }}</VChip>
                  </div>
                </div>
              </td>
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
import RanklistTopstars from '../contest/RanklistTopstars.vue'
import { useContestCapability, useContestData } from '@/utils/contest/inject'

const { t } = useI18n()
const props = defineProps<{
  endpoint: string
}>()

const admin = useContestCapability('admin')
const contest = useContestData()
const participantUrl = (userId: string) =>
  `/org/${contest.value.orgId}/contest/${contest.value._id}/participant/${userId}`
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
