<template>
  <VChip
    :text="status"
    :prepend-icon="display[0]"
    :color="display[1]"
    variant="outlined"
    :to="to"
    v-if="to"
  />
  <VChip :text="status" :prepend-icon="display[0]" :color="display[1]" variant="outlined" v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  to?: string
}>()

const knownStatus: Record<string, [string, string]> = {
  Accepted: ['mdi-check', 'success'],
  Success: ['mdi-check', 'info']
}
const display = computed(() => knownStatus[props.status] ?? ['mdi-circle-outline', ''])
</script>
