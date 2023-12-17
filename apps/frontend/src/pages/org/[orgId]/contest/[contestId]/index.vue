<template>
  <MarkdownRenderer :md="contest.description" class="u-p-4" />
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()
</script>
