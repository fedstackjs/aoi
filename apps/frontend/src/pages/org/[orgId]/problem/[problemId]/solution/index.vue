<template>
  <SolutionList :org-id="orgId" :problem-id="problemId" :self-only="!admin" />
</template>

<script setup lang="ts">
import type { IProblemDTO } from '@/components/problem/types'
import SolutionList from '@/components/solution/SolutionList.vue'
import { useProblemAdminCapability } from '@/utils/problem/inject'

const admin = useProblemAdminCapability()

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
