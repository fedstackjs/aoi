<template>
  <VAlert>Not Implemented {{ model }}</VAlert>
  <!-- <VTextField v-model="model.slug" label="Slug" /> -->
</template>

<script setup lang="ts">
import type { IPlanContestSettings } from '@/types'

const model = defineModel<IPlanContestSettings>({ required: true })
</script>
