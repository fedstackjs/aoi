<template>
  <VCard flat>
    <VCardTitle class="d-flex justify-space-between">
      <div>{{ t('action.submit') }}</div>
      <div class="u-flex u-gap-2">
        <VChip color="blue" variant="outlined">
          {{ t('term.current-hash') }}
          <code class="pl-2">{{ problem.currentDataHash.substring(0, 7) }}</code>
        </VChip>
        <VChip color="success" variant="outlined">
          {{ t('term.runner-label') }}
          <code class="pl-2">{{ problem.config.label }}</code>
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
        <SubmitForm v-if="problem.config.submit.form" :config="problem.config" @upload="submit" />
      </VWindowItem>
      <VWindowItem value="upload-file">
        <SubmitFile v-if="problem.config.submit.upload" :config="problem.config" @upload="submit" />
      </VWindowItem>
      <VWindowItem value="upload-dir">
        <SubmitDir
          v-if="problem.config.submit.zipFolder"
          :config="problem.config"
          @upload="submit"
        />
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
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  contestId?: string
  problem: IProblemDTO | IContestProblemDTO
}>()

const { t } = useI18n()
const toast = useToast()
const currentTab = ref()
const route = useRoute()
const router = useRouter()

async function submit(file: File) {
  try {
    const hash = await computeSHA256(file)
    const size = file.size
    let url = props.contestId
      ? `contest/${props.contestId}/problem/${props.problem._id}/solution`
      : `problem/${props.problem._id}/solution`
    const { solutionId, uploadUrl } = await http
      .post(url, {
        json: { hash, size }
      })
      .json<{
        solutionId: string
        uploadUrl: string
      }>()
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file
    })
    url = props.contestId
      ? `contest/${props.contestId}/solution/${solutionId}/submit`
      : `problem/${props.problem._id}/solution/${solutionId}/submit`
    await http.post(url)
    toast.success(t('submit-success'))
    url = props.contestId
      ? `/org/${route.params.orgId}/contest/${props.contestId}/solution/${solutionId}`
      : `/org/${route.params.orgId}/problem/${props.problem._id}/solution/${solutionId}`
    router.push(url)
  } catch (err) {
    toast.error(t('failed', { msg: `${err}` }))
  }
}
</script>

<i18n>
en:
  submit-form: Form
  submit-upload-file: Upload File
  submit-upload-dir: Upload Directory
  submit-success: Submitted successfully
zh-Hans:
  submit-form: 可视化提交
  submit-upload-file: 上传文件
  submit-upload-dir: 上传目录
  submit-success: 提交成功
</i18n>
