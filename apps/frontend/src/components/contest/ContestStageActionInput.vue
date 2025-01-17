<template>
  <div class="u-grid u-grid-cols-4 u-gap-1">
    <VSelect v-model="model.type" :items="['link']" label="Type" density="compact" hide-details />
    <VTextField v-model="model.title" label="Title" density="compact" hide-details />
    <VTextField v-model="model.icon" label="Icon" density="compact" hide-details />
    <VTextField v-model="model.target" label="Target" density="compact" hide-details />
  </div>
</template>

<script setup lang="ts">
import type { IContestAction } from '@/types'

const model = defineModel<IContestAction>({ required: true })
</script>
