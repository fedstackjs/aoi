<template>
  <VCard variant="flat">
    <VCardText v-if="!problems.length">
      <VAlert type="info">{{ t('no-problem') }}</VAlert>
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
