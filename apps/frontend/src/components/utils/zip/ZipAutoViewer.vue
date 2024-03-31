<template>
  <VAlert v-if="error" type="info">
    {{ msg }}
    <details>
      <summary>{{ t('details') }}</summary>
      <div>{{ error }}</div>
    </details>
  </VAlert>
  <ZipViewer v-else-if="zip" :zip="zip" :default-file="defaultFile" :show-metadata="showMetadata" />
</template>

<script setup lang="ts">
import JSZip from 'jszip'
import { HTTPError } from 'ky'
import { ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

import ZipViewer from './ZipViewer.vue'

import { noMessage, useAsyncTask } from '@/utils/async'
import { http } from '@/utils/http'

const props = defineProps<{
  endpoint: string
  defaultFile?: string
  showMetadata?: boolean
}>()

const { t } = useI18n()
const zip = shallowRef<JSZip>()
const msg = ref('')
const error = ref('')

const task = useAsyncTask(async () => {
  try {
    // TODO: check large files
    const { url } = await http.get(`${props.endpoint}/download`).json<{ url: string }>()
    const resp = await fetch(url)
    const blob = await resp.blob()
    const file = new File([blob], 'data.zip', { type: 'application/zip' })
    zip.value = await JSZip.loadAsync(file)
  } catch (err) {
    if (err instanceof HTTPError) {
      msg.value = t('cannot-view-solution')
      const data = await err.response.json()
      error.value = data.message ?? `${err}`
    } else if (err instanceof TypeError) {
      msg.value = t('failed-to-download')
      error.value = `${err}`
    } else {
      msg.value = t('not-a-zip-file')
      error.value = `${err}`
    }
  }
  return noMessage()
})

task.execute()
</script>

<i18n>
en:
  not-a-zip-file: "The solution data is not a zip file, please download it and check manually."
  failed-to-download: "Failed to download the solution data."
  cannot-view-solution: "Cannot view the solution data."
  details: Details
zh:
  not-a-zip-file: "提交数据格式不为zip文件，请下载并手动查看。"
  failed-to-download: "下载提交数据失败。"
  cannot-view-solution: "无法查看提交数据。"
  details: 细节
</i18n>
