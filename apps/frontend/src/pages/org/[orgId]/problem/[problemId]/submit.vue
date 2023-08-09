<template>
  <ProblemSubmit :problem="problem" />
</template>

<script setup lang="ts">
import ProblemSubmit from '@/components/problem/ProblemSubmit.vue'
import type { IProblemDTO } from '@/components/problem/types'

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
