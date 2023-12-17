<template>
  <ZipViewer v-if="zip" :zip="zip" :default-file="props.defaultFile" />
</template>

<script setup lang="ts">
import { noMessage, useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'
import { shallowRef } from 'vue'
import JSZip from 'jszip'
import ZipViewer from './ZipViewer.vue'

const props = defineProps<{
  endpoint: string
  defaultFile?: string
}>()
const zip = shallowRef<JSZip>()

const task = useAsyncTask(async () => {
  // TODO: check large files
  const { url } = await http.get(`${props.endpoint}/download`).json<{ url: string }>()
  const resp = await fetch(url)
  const blob = await resp.blob()
  const file = new File([blob], 'data.zip', { type: 'application/zip' })
  zip.value = await JSZip.loadAsync(file)
  return noMessage()
})

task.execute()
</script>
