<template>
  <VCard variant="flat">
    <VCardText v-if="!contests.length">
      <VAlert type="info">{{ t('no-contest') }}</VAlert>
    </VCardText>
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
