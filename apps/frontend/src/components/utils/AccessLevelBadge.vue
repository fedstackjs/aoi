<template>
  <VBadge :icon="icons[accessLevel]" :color="colors[accessLevel]" v-bind="$attrs">
    <slot />
  </VBadge>
</template>

<script setup lang="ts">
defineProps<{
  accessLevel: number
}>()

const icons = ['mdi-earth', 'mdi-shield-outline', 'mdi-lock-outline']

const colors = ['success', 'info', 'primary']
</script>
