<template>
  <VCard :title="t('create-data-version')" variant="flat">
    <VCardText>
      <VFileInput v-model="uploadInfo.file" />
      <VTextField :model-value="uploadInfo.hash" readonly label="SHA256 Hash" />
      <VTextField label="description" v-model="uploadInfo.description" />
      <VCardSubtitle>{{ t('config') }}</VCardSubtitle>
      <MonacoEditor v-model="uploadInfo.configJson" language="json" />
    </VCardText>
    <VCardActions>
      <VBtn prepend-icon="mdi-upload" rounded="none" class="my-auto" @click="uploadFile()">
        {{ t('upload') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { http } from '@/utils/http'
import { reactive } from 'vue'
import type { IProblemDTO } from './types'
import { watch } from 'vue'
import { computeSHA256 } from '@/utils/files'
import zip from 'jszip'
import { useToast } from 'vue-toastification'
import { problemConfigSchema } from '@aoi/common'
import monaco from '@/utils/monaco'
import MonacoEditor from '../utils/MonacoEditor.vue'

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  schemas: [
    {
      uri: 'local://schemas/problem_config.json',
      schema: problemConfigSchema
    }
  ]
})

const props = defineProps<{
  problem: IProblemDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const toast = useToast()

const uploadInfo = reactive({
  file: [] as File[],
  hash: '',
  description: '',
  configJson: JSON.stringify(
    {
      $schema: 'local://schemas/problem_config.json'
    },
    null,
    2
  )
})

watch(
  () => uploadInfo.file,
  () => {
    if (uploadInfo.file.length > 0) {
      handleFile()
    }
  }
)

async function handleFile() {
  const file = uploadInfo.file[0]
  try {
    uploadInfo.hash = await computeSHA256(file)
    const result = await zip.loadAsync(file)
    const content = await result.file('problem.json')?.async('string')
    if (content) {
      uploadInfo.configJson = content
    } else {
      toast.warning('problem.json not found in zip file, please check your file')
    }
  } catch (err) {
    toast.error('Failed to parse problem data, is it a zip file?')
  }
}

async function uploadFile() {
  try {
    const resp = await http.get(`problem/${props.problem._id}/data/${uploadInfo.hash}/url/upload`)
    const { url } = await resp.json<{ url: string }>()
    await fetch(url, {
      method: 'PUT',
      body: uploadInfo.file[0]
    })
    await http.post(`problem/${props.problem._id}/data`, {
      json: {
        hash: uploadInfo.hash,
        description: uploadInfo.description,
        config: JSON.parse(uploadInfo.configJson)
      }
    })
    emit('updated')
  } catch (err) {
    toast.error(`Failed to upload: ${err}`)
  }
}
</script>
