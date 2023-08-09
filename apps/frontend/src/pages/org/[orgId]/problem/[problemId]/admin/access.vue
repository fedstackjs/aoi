<template>
  <AssociationEditor :prefix="`problem/${problem._id}/admin/access`" :bits="problemBits" />
</template>

<script setup lang="ts">
import type { IProblemDTO } from '@/components/problem/types'
import AssociationEditor from '@/components/utils/AssociationEditor.vue'
import { problemBits } from '@/utils/capability'

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()
</script>
