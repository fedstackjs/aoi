<template>
  <SolutionList :org-id="orgId" :problem-id="problemId" :self-only="selfOnly" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { IProblemDTO } from '@/components/problem/types'
import SolutionList from '@/components/solution/SolutionList.vue'
import { useProblemAdminCapability, useProblemSettings } from '@/utils/problem/inject'

const admin = useProblemAdminCapability()
const settings = useProblemSettings()
const selfOnly = computed(() => !admin.value && !settings.value?.solutionShowOther)

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
