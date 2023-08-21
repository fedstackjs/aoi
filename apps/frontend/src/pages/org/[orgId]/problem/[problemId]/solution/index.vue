<template>
  <SolutionList :org-id="orgId" :problem-id="problemId" />
</template>

<script setup lang="ts">
import type { IProblemDTO } from '@/components/problem/types'
import SolutionList from '@/components/solution/SolutionList.vue'

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
