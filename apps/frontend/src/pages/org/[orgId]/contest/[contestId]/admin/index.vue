<template>
  <VCard flat :title="t('problem-settings')">
    <VDivider />
    <VCardSubtitle>
      {{ t('danger-zone') }}
    </VCardSubtitle>
    <VCardText>
      <VBtn color="red" variant="elevated">
        {{ t('delete') }}
      </VBtn>
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
}>()

const { t } = useI18n()
</script>

<i18n>
zhHans:
  problem-settings: 设置
en:
  problem-settings: Settings
</i18n>
