<template>
  <VCard variant="flat" class="d-flex flex-column items-stretch">
    <VCardTitle class="d-flex align-center justify-space-between">
      <div>{{ file.name }}</div>
      <VAutocomplete
        v-model="language"
        class="u-max-w-48"
        density="compact"
        :items="languages"
        label="Language"
        dense
        outlined
        hide-details
      />
    </VCardTitle>
    <VProgressLinear v-if="loading" indeterminate color="primary" />
    <MonacoEditor
      readonly
      :model-value="content.state.value ?? ''"
      :language="language"
      class="u-flex-1"
    />
  </VCard>
</template>

<script setup lang="ts">
import { debouncedRef, useAsyncState } from '@vueuse/core'
import type JSZip from 'jszip'
import { watch, ref } from 'vue'

import MonacoEditor from '../MonacoEditor.vue'

import { detectLanguage } from '@/utils/editor'
import { getSupportedLanguages } from '@/utils/monaco'

const props = defineProps<{
  file: JSZip.JSZipObject
}>()

const language = ref('plaintext')
const languages = getSupportedLanguages()

const content = useAsyncState(async () => {
  const text = await props.file.async('string')
  language.value = await detectLanguage(text, props.file.name)
  return text
}, null as never)
const loading = debouncedRef(content.isLoading)

watch(
  () => props.file,
  () => content.execute()
)
</script>
