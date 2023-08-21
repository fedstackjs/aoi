<template>
  <VCard variant="flat">
    <VCardText v-if="!ranklists.length">
      <VAlert type="info">{{ t('no-ranklist') }}</VAlert>
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
