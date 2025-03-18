<template>
  <VCard flat>
    <InstanceList :org-id="orgId" :problem-id="problemId" :self-only="selfOnly" />
  </VCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import InstanceList from '@/components/instance/InstanceList.vue'
import type { IProblemDTO } from '@/components/problem/types'
import { useProblemAdminCapability, useProblemSettings } from '@/utils/problem/inject'

const admin = useProblemAdminCapability()
const settings = useProblemSettings()
const selfOnly = computed(() => !admin.value)

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
