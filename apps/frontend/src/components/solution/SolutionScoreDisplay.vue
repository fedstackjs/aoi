<template>
  <component :is="to ? RouterLink : 'span'" :to="to" style="text-decoration: none; color: inherit">
    <code
      :style="{ color: palette(score) }"
      v-text="Number(((score * (scoreScale ?? 100)) / 100).toFixed(2))"
      class="u-text-lg"
    />
    <code v-if="scoreScale" class="text-secondary">/{{ scoreScale }}</code>
  </component>
</template>

<script setup lang="ts">
import { palette } from '@/utils/colors'
import { RouterLink } from 'vue-router'

defineProps<{
  score: number
  scoreScale?: number
  to?: string
}>()
</script>
