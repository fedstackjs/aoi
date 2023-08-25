<template>
  <VChip :text="status" :prepend-icon="display[0]" :color="display[1]" variant="outlined" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const knownStatus: Record<string, [string, string]> = {
  Accepted: ['mdi-check', 'success']
}
const display = computed(() => knownStatus[props.status] ?? ['mdi-circle-outline', ''])
</script>
