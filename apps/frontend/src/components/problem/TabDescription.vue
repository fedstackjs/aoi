<template>
  <VCard flat>
    <MarkdownRenderer :md="description" class="pa-4" />
  </VCard>
</template>

<script setup lang="ts">
import MarkdownRenderer from '../utils/MarkdownRenderer.vue'

defineProps<{
  description: string
}>()
</script>
