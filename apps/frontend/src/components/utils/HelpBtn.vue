<template>
  <VBtn :href="href" target="_blank" variant="text" color="info" icon="mdi-help-circle-outline" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  category: string
}>()

const href = computed(() => `https://aoi.fedstack.org/${props.category}`)
</script>
