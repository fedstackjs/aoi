<template>
  <code
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
}>()
</script>
