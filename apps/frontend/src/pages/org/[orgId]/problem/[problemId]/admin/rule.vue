<template>
  <RulesEditor :endpoint="`problem/${problemId}/admin/rule`" id="problem" />
</template>

<script setup lang="ts">
import RulesEditor from '@/components/common/RulesEditor.vue'
import type { IProblemDTO } from '@/components/problem/types'

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
