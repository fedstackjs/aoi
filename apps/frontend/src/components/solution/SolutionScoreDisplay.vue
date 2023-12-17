<template>
  <RouterLink v-if="to" :to="to" style="text-decoration: none; color: inherit">
    <code
      :style="{ color: palette(score) }"
      v-text="Number(((score * (scoreScale ?? 100)) / 100).toFixed(2))"
      class="u-text-lg"
    />
  </RouterLink>
  <code
    v-else
    :style="{ color: palette(score) }"
    v-text="Number(((score * (scoreScale ?? 100)) / 100).toFixed(2))"
    class="u-text-lg"
  />
</template>

<script setup lang="ts">
import { palette } from '@/utils/colors'

defineProps<{
  score: number
  scoreScale?: number
  to?: string
}>()
</script>
