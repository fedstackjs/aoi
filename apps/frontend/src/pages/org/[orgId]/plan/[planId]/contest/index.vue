<template>
  <VCard variant="flat">
    <VCardText v-if="!contests.length">
      <VAlert type="info">{{ t('msg.no-contest') }}</VAlert>
    </VCardText>
    <template v-else>
      <VCardTitle>Contests of this Plan</VCardTitle>
    </template>
    <VCardText> There are total {{ contests.length }} contests! </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import type { IPlanDTO, IPlanContestDTO } from '@/components/plan/types'
import { useI18n } from 'vue-i18n'

defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
  contests: IPlanContestDTO[]
}>()

const { t } = useI18n()
</script>
