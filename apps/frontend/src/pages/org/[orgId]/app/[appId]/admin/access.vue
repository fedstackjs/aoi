<template>
  <AssociationEditor :prefix="`app/${appId}/admin/access`" :bits="appBits" :org-id="orgId" />
</template>

<script setup lang="ts">
import AssociationEditor from '@/components/utils/AssociationEditor.vue'
import { appBits } from '@/utils/capability'

defineProps<{
  orgId: string
  appId: string
}>()
</script>
