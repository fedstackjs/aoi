<template>
  <VCard flat>
    <RouterView :contest="contest" />
  </VCard>
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()
</script>
