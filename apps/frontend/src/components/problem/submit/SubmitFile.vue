<template>
  <VCard variant="flat">
    <VCardText>
      <VFileInput v-model="files" label="Upload" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary" @click="submit">Submit</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import type { ProblemConfig } from '@aoi/common'
import { ref } from 'vue'

defineProps<{
  config: ProblemConfig
}>()

const emit = defineEmits<{
  (ev: 'upload', file: File): void
}>()

const files = ref<File[]>([])

function submit() {
  if (files.value.length) {
    emit('upload', files.value[0])
  }
}
</script>
