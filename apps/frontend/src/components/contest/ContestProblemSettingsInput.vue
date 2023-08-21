<template>
  <VTextField v-model="model.slug" label="Slug" />
  <VTextField v-model="model.score" label="Score" type="number" />
  <VTextField v-model="model.solutionCountLimit" label="Solution Count Limit" type="number" />
  <VTextField v-model="model.showAfter" label="Show After" type="number" />
</template>

<script setup lang="ts">
const model = defineModel<{
  score: number
  slug: string
  solutionCountLimit: number
  showAfter: number
}>({ required: true })
</script>
