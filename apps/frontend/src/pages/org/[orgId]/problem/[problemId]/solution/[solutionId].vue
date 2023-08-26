<template>
  <SolutionView :org-id="orgId" :solution-id="solutionId" :problem-id="problemId" :admin="admin" />
</template>

<script setup lang="ts">
import SolutionView from '@/components/solution/SolutionView.vue'
import { useProblemCapability } from '@/utils/problem/inject'

defineProps<{
  orgId: string
  problemId: string
  solutionId: string
}>()

const admin = useProblemCapability('admin')
</script>
