<template>
  <VTextField v-model="model.showBefore" label="Show Before" type="number" />
  <VTextField v-model="model.showAfter" label="Show After" type="number" />
</template>

<script setup lang="ts">
const model = defineModel<{
  showBefore: number
  showAfter: number
}>({ required: true })
</script>
