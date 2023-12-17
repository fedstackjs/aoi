<template>
  <VCard variant="flat" v-if="form">
    <div v-for="(file, i) of form.files" :key="file.path">
      <VDivider v-if="i" />
      <VCardSubtitle>{{ file.label ?? file.path }}</VCardSubtitle>
      <FormEditor v-if="file.type.editor" v-model="files[file.path]" :options="file.type.editor" />
      <FormMetadata
        v-if="file.type.metadata"
        v-model="files[file.path]"
        :options="file.type.metadata"
      />
      <VCardText v-if="file.description">{{ file.description }}</VCardText>
    </div>
    <VCardActions>
      <VBtn color="primary" @click="submit">{{ t('action.submit') }}</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ProblemConfig } from '@aoi-js/common'
import { computed, reactive } from 'vue'
import Zip from 'jszip'
import FormEditor from './form/FormEditor.vue'
import FormMetadata from './form/FormMetadata.vue'

const { t } = useI18n()

const props = defineProps<{
  config: ProblemConfig
}>()

const form = computed(() => props.config.submit.form)
const files = reactive<Record<string, string>>({})

const emit = defineEmits<{
  (ev: 'upload', file: File): void
}>()

function submit() {
  const zip = new Zip()
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content)
  }
  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const zipFile = new File([blob], 'data.zip', { type: 'application/zip' })
    emit('upload', zipFile)
  })
}
</script>
