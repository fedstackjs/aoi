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
    <VTabs v-show="!submitting" v-model="currentTab">
      <VTab v-if="problem.config.submit.form" prepend-icon="mdi-form-textarea" value="form">
        {{ t('submit-form') }}
      </VTab>
      <VTab v-if="problem.config.submit.upload" prepend-icon="mdi-file" value="upload-file">
        {{ t('submit-upload-file') }}
      </VTab>
      <VTab v-if="problem.config.submit.zipFolder" prepend-icon="mdi-folder" value="upload-dir">
        {{ t('submit-upload-dir') }}
      </VTab>
    </VTabs>
    <VWindow v-show="!submitting" v-model="currentTab">
      <VWindowItem value="form">
        <SubmitForm v-if="problem.config.submit.form" :config="problem.config" @upload="submit">
          <VCheckbox hide-details v-model="preferPrivate" :label="t('solution.prefer-private')" />
        </SubmitForm>
      </VWindowItem>
      <VWindowItem value="upload-file">
        <SubmitFile v-if="problem.config.submit.upload" :config="problem.config" @upload="submit">
          <VCheckbox hide-details v-model="preferPrivate" :label="t('solution.prefer-private')" />
        </SubmitFile>
      </VWindowItem>
      <VWindowItem value="upload-dir">
        <SubmitDir v-if="problem.config.submit.zipFolder" :config="problem.config" @upload="submit">
          <VCheckbox hide-details v-model="preferPrivate" :label="t('solution.prefer-private')" />
        </SubmitDir>
      </VWindowItem>
    </VWindow>
    <VCardText v-if="submitting" class="text-center">
      <VProgressCircular size="48" :indeterminate="indeterminate" :model-value="progress" />
      <div class="u-pt-4">{{ submitMsg }}</div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import type { IContestProblemDTO } from '../contest/types'

import SubmitDir from './submit/SubmitDir.vue'
import SubmitFile from './submit/SubmitFile.vue'
import SubmitForm from './submit/SubmitForm.vue'
import type { IProblemDTO } from './types'

import { useProblemSubmit } from '@/utils/problem/submit'

const props = defineProps<{
  contestId?: string
  problem: IProblemDTO | IContestProblemDTO
  manualSubmit?: boolean
}>()

const { t } = useI18n()
const currentTab = ref()

const { submitting, submitMsg, indeterminate, progress, submit, preferPrivate } = useProblemSubmit(
  computed(() => props.problem._id),
  toRef(props, 'contestId'),
  toRef(props, 'manualSubmit')
)
</script>

<i18n>
en:
  submit-form: Form
  submit-upload-file: Upload File
  submit-upload-dir: Upload Directory
  submit-success: Submitted successfully
  failed:
    solution-limit-reached: Solution limit reached
zh-Hans:
  submit-form: 可视化提交
  submit-upload-file: 上传文件
  submit-upload-dir: 上传目录
  submit-success: 提交成功
  failed:
    solution-limit-reached: 提交次数已达上限
</i18n>
