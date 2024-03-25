<template>
  <VCard :title="t('create-data-version')" variant="flat">
    <VCardText>
      <VFileInput v-model="uploadInfo.file" />
      <VTextField v-model="uploadInfo.hash" :readonly="!advanced" label="SHA256 Hash" />
      <VTextField v-model="uploadInfo.description" :label="t('term.description')" />
      <VCardSubtitle>{{ t('term.config') }}</VCardSubtitle>
      <MonacoEditor v-model="uploadInfo.configJson" language="json" uri="internal://problem.json" />
    </VCardText>
    <VCardActions>
      <VBtn
        prepend-icon="mdi-upload"
        variant="tonal"
        @click="uploadFileTask.execute()"
        :loading="uploadFileTask.isLoading.value"
      >
        {{ t('action.upload') }}
      </VBtn>
      <VSpacer />
      <VBtnToggle v-model="advanced" mandatory>
        <VBtn :value="false">
          {{ t('simple-mode') }}
        </VBtn>
        <VBtn :value="true">
          {{ t('advanced-mode') }}
        </VBtn>
      </VBtnToggle>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { SProblemConfigSchema } from '@aoi-js/common'
import { useI18n } from 'vue-i18n'

import MonacoEditor from '../utils/MonacoEditor.vue'

import type { IProblemDTO } from './types'

import monaco from '@/utils/monaco'
import { useDataUpload } from '@/utils/problem/data'

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  schemas: [
    {
      fileMatch: ['problem.json'],
      uri: 'internal://problem.schema.json',
      schema: SProblemConfigSchema
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

const { uploadFileTask, uploadInfo, advanced } = useDataUpload(props.problem._id, () =>
  emit('updated')
)
</script>

<i18n>
en:
  create-data-version: Create data version
  simple-mode: Simple mode
  advanced-mode: Advanced mode
zh-Hans:
  create-data-version: 创建数据版本
  simple-mode: 简单模式
  advanced-mode: 高级模式
</i18n>
