<template>
  <VCard flat>
    <VCardTitle class="d-flex justify-space-between">
      <div>{{ t('submit') }}</div>
      <div>
        {{ t('current-hash') }}
        <VChip color="blue">
          <code>{{ problem.currentDataHash.substring(0, 7) }}</code>
        </VChip>
      </div>
    </VCardTitle>
    <VTabs v-model="currentTab">
      <VTab prepend-icon="mdi-form-textarea" value="form">
        {{ t('submit-form') }}
      </VTab>
      <VTab prepend-icon="mdi-file" value="upload-file">
        {{ t('submit-upload-file') }}
      </VTab>
      <VTab prepend-icon="mdi-folder" value="upload-dir">
        {{ t('submit-upload-dir') }}
      </VTab>
    </VTabs>
    <VWindow v-model="currentTab">
      <VWindowItem value="form">
        <SubmitForm :config="problem.config" @upload="submit" />
      </VWindowItem>
      <VWindowItem value="upload-file">
        <SubmitFile :config="problem.config" @upload="submit" />
      </VWindowItem>
      <VWindowItem value="upload-dir">
        <SubmitDir :config="problem.config" @upload="submit" />
      </VWindowItem>
    </VWindow>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { IProblemDTO } from './types'
import SubmitForm from './submit/SubmitForm.vue'
import SubmitFile from './submit/SubmitFile.vue'
import SubmitDir from './submit/SubmitDir.vue'
import { computeSHA256 } from '@/utils/files'
import { http } from '@/utils/http'
import { useToast } from 'vue-toastification'
import type { IContestProblemDTO } from '../contest/types'

const props = defineProps<{
  contestId?: string
  problem: IProblemDTO | IContestProblemDTO
}>()

const { t } = useI18n()
const toast = useToast()
const currentTab = ref()

async function submit(file: File) {
  const hash = await computeSHA256(file)
  const size = file.size
  const resp = await http.post(`problem/${props.problem._id}/submit`, {
    json: { hash, size }
  })
  const { solutionId, uploadUrl } = await resp.json<{
    solutionId: string
    uploadUrl: string
  }>()
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file
  })
  await http.post(`solution/${solutionId}/submit`)
  toast.success(t('submit-success'))
}
</script>

<i18n>
en:
  submit-form: Form
  submit-upload-file: Upload File
  submit-upload-dir: Upload Directory
  submit-success: Submitted successfully
zhHans:
  submit-form: 可视化提交
  submit-upload-file: 上传文件
  submit-upload-dir: 上传目录
  submit-success: 提交成功
</i18n>
