<template>
  <div v-if="status" class="u-flex u-gap-2 u-items-center">
    <SolutionStatusChip
      :status="status.lastSolutionStatus"
      abbrev
      :score="status.lastSolutionScore"
      :to="`/org/${orgId}/problem/${problemId}/solution/${status.lastSolutionId}`"
    />
  </div>
</template>

<script setup lang="ts">
import SolutionStatusChip from '../solution/SolutionStatusChip.vue'

import type { IProblemStatusDTO } from './types'

defineProps<{
  orgId: string
  problemId: string
  status?: IProblemStatusDTO
}>()
</script>
