<template>
  <VCard :title="t('create-data-version')" variant="flat">
    <VCardText>
      <VFileInput v-model="uploadInfo.file" />
      <VTextField :model-value="uploadInfo.hash" readonly label="SHA256 Hash" />
      <VTextField :label="t('term.description')" v-model="uploadInfo.description" />
      <VCardSubtitle>{{ t('term.config') }}</VCardSubtitle>
      <MonacoEditor v-model="uploadInfo.configJson" language="json" />
    </VCardText>
    <VCardActions>
      <VBtn
        prepend-icon="mdi-upload"
        rounded="none"
        class="my-auto"
        @click="uploadFileTask.execute()"
        :loading="uploadFileTask.isLoading.value"
      >
        {{ t('action.upload') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { IProblemDTO } from './types'
import { problemConfigSchema } from '@aoi-js/common'
import monaco from '@/utils/monaco'
import { useDataUpload } from '@/utils/problem/data'
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

const { uploadFileTask, uploadInfo } = useDataUpload(props.problem._id, () => emit('updated'))
</script>

<i18n>
en:
  create-data-version: Create data version
zh-Hans:
  create-data-version: 创建数据版本
</i18n>
