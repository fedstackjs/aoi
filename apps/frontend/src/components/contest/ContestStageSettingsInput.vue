<template>
  <div class="u-grid u-grid-cols-3">
    <VCheckbox
      density="compact"
      v-for="[key, label] of entries"
      :key="key"
      v-model="model[key]"
      :label="label"
    />
  </div>
</template>

<script setup lang="ts">
import type { IContestStage } from '@/types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const model = defineModel<IContestStage['settings']>({ required: true })

const keys: {
  [key in keyof IContestStage['settings']]: string
} = {
  registrationEnabled: 'registration-enabled',
  registrationAllowPublic: 'registration-allow-public',
  problemEnabled: 'problem-enabled',
  problemShowTags: 'problem-show-tags',
  solutionEnabled: 'solution-enabled',
  solutionAllowSubmit: 'solution-allow-submit',
  solutionShowOther: 'solution-show-other',
  solutionShowOtherDetails: 'solution-show-other-details',
  solutionShowOtherData: 'solution-show-other-data',
  ranklistEnabled: 'ranklist-enabled'
}

const entries = Object.entries(keys).map(([k, v]) => [k, t('contest-stage-settings.' + v)]) as [
  keyof IContestStage['settings'],
  string
][]
</script>

<i18n>
en:
  contest-stage-settings:
    registration-enabled: Registration Enabled
    registration-allow-public: Registration Allow Public
    problem-enabled: Problem Enabled
    problem-show-tags: Problem Show Tags
    solution-enabled: Solution Enabled
    solution-allow-submit: Solution Allow Submit
    solution-show-other: Solution Allow Other
    solution-show-other-details: Solution Allow Other Details
    solution-show-other-data: Solution Allow Other Data
    ranklist-enabled: Ranklist Enabled
zh-Hans:
  contest-stage-settings:
    registration-enabled: 启用注册
    registration-allow-public: 允许公开注册
    problem-enabled: 启用题目
    problem-show-tags: 题目显示标签
    solution-enabled: 启用提交记录
    solution-allow-submit: 允许提交
    solution-show-other: 允许展示他人提交记录
    solution-show-other-details: 允许展示他人提交记录细节
    solution-show-other-data: 允许展示他人提交记录数据
    ranklist-enabled: 启用排名
</i18n>
