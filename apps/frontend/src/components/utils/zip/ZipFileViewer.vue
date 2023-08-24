<template>
  <VCard variant="flat">
    <VCardTitle>{{ file.name }}</VCardTitle>
    <AsyncState :state="content">
      <template v-slot="{ value }">
        <MonacoEditor readonly v-model="value.text" :language="value.language" />
      </template>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import type JSZip from 'jszip'
import { watch } from 'vue'
import MonacoEditor from '../MonacoEditor.vue'
import AsyncState from '../AsyncState.vue'

const props = defineProps<{
  file: JSZip.JSZipObject
}>()

const content = useAsyncState(async () => {
  const text = await props.file.async('string')
  return {
    text,
    language: 'plaintext'
  }
}, null as never)

watch(
  () => props.file,
  () => content.execute()
)
</script>
