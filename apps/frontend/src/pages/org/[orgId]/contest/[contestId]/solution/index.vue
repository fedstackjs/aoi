<template>
  <SolutionList :org-id="orgId" :contest-id="contestId" />
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import SolutionList from '@/components/solution/SolutionList.vue'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()
</script>
