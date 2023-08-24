<template>
  <VCard variant="flat">
    <VCardText>
      <VFileInput v-model="files" :label="t('action.upload')" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary" @click="submit">{{ t('action.submit') }}</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ProblemConfig } from '@aoi-js/common'
import { ref } from 'vue'

const { t } = useI18n()

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
