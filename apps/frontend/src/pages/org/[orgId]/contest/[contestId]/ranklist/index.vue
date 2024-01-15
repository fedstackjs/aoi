<template>
  <VCard variant="flat">
    <VCardText v-if="!ranklists.length">
      <VAlert type="info">{{ t('msg.no-ranklist') }}</VAlert>
    </VCardText>
    <VCardText v-else>
      {{ t('ranklist-msg', { count: ranklists.length }) }}
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import { useI18n } from 'vue-i18n'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  ranklists: [{ key: string; name: string }]
}>()

const { t } = useI18n()
</script>

<i18n>
en:
  ranklist-msg: |
    There are {count} ranklists in this contest. Select one from left to start.
zh-Hans:
  ranklist-msg: |
    这场比赛有 {count} 个排行榜。从左侧选择一个开始。
</i18n>
