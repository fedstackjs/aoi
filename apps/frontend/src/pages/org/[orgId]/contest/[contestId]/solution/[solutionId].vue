<template>
  <SolutionView :org-id="orgId" :solution-id="solutionId" :contest-id="contestId" />
</template>

<script setup lang="ts">
import SolutionView from '@/components/solution/SolutionView.vue'

defineProps<{
  orgId: string
  contestId: string
  solutionId: string
}>()
</script>
