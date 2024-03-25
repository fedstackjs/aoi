<template>
  <VCard variant="flat" v-if="form">
    <div v-for="(file, i) of form.files" :key="file.path">
      <VDivider v-if="i" />
      <div class="d-flex align-center px-6 py-2">
        <b v-if="file.label" class="text-h5">{{ file.label }}</b>
        <VSpacer />
        <code class="pr-2 text-secondary">
          {{ file.path }}
        </code>
      </div>
      <VAlert v-if="file.description" type="info" color="transparent">
        <MarkdownRenderer :md="file.description" />
      </VAlert>
      <FormEditor v-if="file.type.editor" v-model="files[file.path]" :options="file.type.editor" />
      <FormMetadata
        v-if="file.type.metadata"
        v-model="files[file.path]"
        :options="file.type.metadata"
      />
    </div>
    <VCardActions>
      <VBtn color="primary" @click="submit">{{ t('action.submit') }}</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import type { ProblemConfig } from '@aoi-js/common'
import Zip from 'jszip'
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import FormEditor from './form/FormEditor.vue'
import FormMetadata from './form/FormMetadata.vue'

import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'

const { t } = useI18n()

const props = defineProps<{
  config: ProblemConfig
}>()

const form = computed(() => props.config.submit.form)
const files = reactive<Record<string, string>>(
  Object.fromEntries(form.value?.files.map((file) => [file.path, file.default ?? '']) ?? [])
)

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
