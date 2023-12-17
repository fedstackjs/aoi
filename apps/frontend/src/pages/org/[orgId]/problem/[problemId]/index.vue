<template>
  <VCard flat>
    <MarkdownRenderer :md="problem.description" class="pa-4" />
  </VCard>
</template>

<script setup lang="ts">
import type { IProblemDTO } from '@/components/problem/types'
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
