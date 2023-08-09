<template>
  <AssociationEditor :prefix="`contest/${contestId}/admin/access`" :bits="contestBits" />
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import AssociationEditor from '@/components/utils/AssociationEditor.vue'
import { contestBits } from '@/utils/capability'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()
</script>
