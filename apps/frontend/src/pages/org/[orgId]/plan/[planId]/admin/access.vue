<template>
  <AssociationEditor :prefix="`plan/${planId}/admin/access`" :bits="planBits" :org-id="orgId" />
</template>

<script setup lang="ts">
import type { IPlanDTO } from '@/components/plan/types'
import AssociationEditor from '@/components/utils/AssociationEditor.vue'
import { planBits } from '@/utils/capability'

defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
}>()
</script>
