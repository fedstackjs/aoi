<template>
  <VCard flat>
    <AsyncState :state="versions">
      <template v-slot="{ value }">
        <VTable>
          <thead>
            <tr>
              <th>{{ t('hash') }}</th>
              <th>{{ t('description') }}</th>
              <th>{{ t('created-at') }}</th>
              <th>{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="version in value" :key="version.hash">
              <td>
                <VIcon
                  icon="mdi-file-outline"
                  :color="version.hash === problem.currentDataHash ? 'blue' : undefined"
                />
                <code>{{ version.hash.substring(0, 7) }}</code>
              </td>
              <td>{{ version.description }}</td>
              <td>{{ new Date(version.createdAt).toLocaleString() }}</td>
              <td>
                <VBtn variant="plain" icon="mdi-check" @click="active(version.hash)" />
                <VBtn variant="plain" icon="mdi-download" @click="download(version.hash)" />
                <VBtn variant="plain" icon="mdi-delete" @click="remove(version.hash)" />
              </td>
            </tr>
          </tbody>
        </VTable>
      </template>
    </AsyncState>
    <VDivider />
    <DataUpload :problem="problem" @updated="versions.execute()" />
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import type { IProblemDTO } from '@/components/problem/types'
import { useAsyncState } from '@vueuse/core'
import AsyncState from '@/components/utils/AsyncState.vue'
import DataUpload from '@/components/problem/DataUpload.vue'

const { t } = useI18n()

const props = defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const versions = useAsyncState(async () => {
  const resp = await http.get(`problem/${props.problem._id}/data`)
  const data = await resp.json<
    {
      hash: string
      description: string
      createdAt: number
      config: unknown
    }[]
  >()
  return data
}, null as never)

const snackbarRunning = ref(false)
const snackbarText = ref('')

async function active(hash: string) {
  await http.post(`problem/${props.problem._id}/data/setDataHash`, {
    json: { hash }
  })
  emit('updated')
}

async function download(hash: string) {
  const resp = await http.get(`problem/${props.problem._id}/data/${hash}/url/download`)
  const { url } = await resp.json<{ url: string }>()
  window.open(url)
}

async function remove(hash: string) {
  try {
    const resp = await http.get(`problem/${props.problem._id}/data/${hash}/url/delete`)
    const { url } = await resp.json<{ url: string }>()
    await fetch(url, { method: 'DELETE' })
    await http.delete(`problem/${props.problem._id}/data/${hash}`)
    versions.execute()
  } catch (err) {
    snackbarText.value = `Failed to delete: ${err}`
    snackbarRunning.value = true
  }
}
</script>

<i18n>
en:
  filename: File Name
  description: Description
  actions: Actions
  filelist: File List
  upload-file: Upload File
  upload: Upload
  close: Close
zhHans:
  filename: 文件名
  description: 描述
  actions: 操作
  filelist: 文件列表
  upload-file: 上传文件
  upload: 上传
  close: 关闭
</i18n>
