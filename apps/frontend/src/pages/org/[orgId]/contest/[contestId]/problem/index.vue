<template>
  <VCard variant="flat">
    <VCardText v-if="!problems.length">
      <VAlert type="info">{{ t('msg.no-problem') }}</VAlert>
    </VCardText>
    <VCardText v-else>
      {{ t('problem-msg', { count: problems.length }) }}
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import type { IContestDTO, IContestProblemListDTO } from '@/components/contest/types'
import { useI18n } from 'vue-i18n'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  problems: IContestProblemListDTO[]
}>()

const { t } = useI18n()
</script>

<i18n>
en:
  problem-msg: |
    There are {count} problems in this contest. Select one from left to start.
zh-Hans:
  problem-msg: |
    这场比赛有 {count} 道题目。从左侧选择一道开始。
</i18n>
