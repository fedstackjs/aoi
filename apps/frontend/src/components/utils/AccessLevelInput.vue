<template>
  <VBtnToggle v-model="model" variant="outlined">
    <VBtn>PUBLIC</VBtn>
    <VBtn>RESTRICTED</VBtn>
    <VBtn>PRIVATE</VBtn>
  </VBtnToggle>
</template>

<script setup lang="ts">
const model = defineModel<number>({ required: true })
</script>
