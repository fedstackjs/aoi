<template>
  <VChip :text="accessLevels[accessLevel] ?? 'ERROR'" />
</template>

<script setup lang="ts">
defineProps<{
  accessLevel: number
}>()

const accessLevels = ['PUBLIC', 'RESTRICTED', 'PRIVATE']
</script>
