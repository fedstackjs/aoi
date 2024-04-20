<template>
  <RulesEditor :endpoint="`contest/${contestId}/admin/rule`" id="contest" />
</template>

<script setup lang="ts">
import RulesEditor from '@/components/common/RulesEditor.vue'
import type { IContestDTO } from '@/components/contest/types'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()
</script>
