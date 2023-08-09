<template>
  {{ t('ranklist') }}
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
