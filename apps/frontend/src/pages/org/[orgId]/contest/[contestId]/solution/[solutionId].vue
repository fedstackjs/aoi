<template>
  <SolutionView :org-id="orgId" :solution-id="solutionId" :contest-id="contestId" :admin="admin" />
</template>

<script setup lang="ts">
import SolutionView from '@/components/solution/SolutionView.vue'
import { useContestCapability } from '@/utils/contest/inject'

defineProps<{
  orgId: string
  contestId: string
  solutionId: string
}>()

const admin = useContestCapability('admin')
</script>
