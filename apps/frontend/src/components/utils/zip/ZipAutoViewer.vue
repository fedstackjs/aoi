<template>
  <VAlert v-if="error" type="info">
    {{ t('not-a-zip-file') }}
    <details>
      <summary>{{ t('details') }}</summary>
      <div>{{ error }}</div>
    </details>
  </VAlert>
  <ZipViewer v-else-if="zip" :zip="zip" :default-file="defaultFile" :show-metadata="showMetadata" />
</template>

<script setup lang="ts">
import { noMessage, useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'
import { ref, shallowRef } from 'vue'
import JSZip from 'jszip'
import ZipViewer from './ZipViewer.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  endpoint: string
  defaultFile?: string
  showMetadata?: boolean
}>()

const { t } = useI18n()
const zip = shallowRef<JSZip>()
const error = ref('')

const task = useAsyncTask(async () => {
  // TODO: check large files
  const { url } = await http.get(`${props.endpoint}/download`).json<{ url: string }>()
  const resp = await fetch(url)
  const blob = await resp.blob()
  const file = new File([blob], 'data.zip', { type: 'application/zip' })
  try {
    zip.value = await JSZip.loadAsync(file)
  } catch (err) {
    error.value = `${err}`
  }
  return noMessage()
})

task.execute()
</script>

<i18n>
en:
  not-a-zip-file: "The solution data is not a zip file, please download it and check manually."
  details: Details
zh:
  not-a-zip-file: "提交数据格式不为zip文件，请下载并手动查看。"
  details: 细节
</i18n>
