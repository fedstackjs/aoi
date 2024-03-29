<template>
  <VChip
    v-if="variant === 'chip'"
    variant="tonal"
    rounded
    :prepend-icon="icons[accessLevel]"
    :color="colors[accessLevel]"
    v-bind="$attrs"
  >
    {{ t(`access-level.${names[accessLevel]}`) }}
  </VChip>
  <VBadge v-else :icon="icons[accessLevel]" :color="colors[accessLevel]" v-bind="$attrs">
    <slot />
  </VBadge>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  accessLevel: number
  variant?: 'chip'
}>()

const { t } = useI18n()

const icons = ['mdi-earth', 'mdi-shield-outline', 'mdi-lock-outline']
const colors = ['success', 'info', 'primary']
const names = ['public', 'restricted', 'private']
</script>
