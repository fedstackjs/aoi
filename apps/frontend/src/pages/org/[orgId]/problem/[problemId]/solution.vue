<template>
  <VCard flat>
    <RouterView :problem="problem" />
  </VCard>
</template>

<script setup lang="ts">
import type { IProblemDTO } from '@/components/problem/types'

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
