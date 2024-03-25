<template>
  <VCard variant="flat">
    <VCardText>
      <VFileInput v-model="files" :label="t('action.upload')" webkitdirectory />
    </VCardText>
    <VCardActions>
      <VBtn color="primary" @click="submit">{{ t('action.submit') }}</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import type { ProblemConfig } from '@aoi-js/common'
import Zip from 'jszip'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
    const zip = new Zip()
    for (const file of files.value) {
      // strip the leading directory
      const path = file.webkitRelativePath.split('/').slice(1).join('/')
      zip.file(path, file)
    }
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      const zipFile = new File([blob], 'data.zip', { type: 'application/zip' })
      emit('upload', zipFile)
    })
  }
}
</script>
