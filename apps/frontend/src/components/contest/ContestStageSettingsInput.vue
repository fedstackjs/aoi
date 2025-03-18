<template>
  <VDivider />
  <VCardSubtitle class="pl-0 pb-2">Settings</VCardSubtitle>
  <div class="u-grid u-grid-cols-3">
    <VCheckbox
      density="compact"
      v-for="[key, label, hint] of entries"
      :key="key"
      v-model="model[key]"
      :label="label"
      :messages="hint"
    />
  </div>
  <VTextField
    v-model.number="model.instanceLimit"
    type="number"
    min="0"
    max="100"
    label="Instance Limit"
    density="compact"
    hide-details
    class="u-py-4"
  />
  <VDivider />
  <VCardSubtitle class="pl-0 pb-2">Tag Rules</VCardSubtitle>
  <ContestStageTagRulesInput v-model="model.tagRules" />
  <VDivider />
  <VCardSubtitle class="pl-0 pb-2">Actions</VCardSubtitle>
  <OptionalInput v-model="model.actions" :init="() => []">
    <template v-slot="scoped">
      <ListInput
        v-model="scoped.value"
        :init="() => ({ type: 'link', icon: '', title: '', target: '' }) as const"
        label="Actions"
      >
        <template v-slot="scoped">
          <ContestStageActionInput v-model="scoped.value" />
        </template>
      </ListInput>
    </template>
  </OptionalInput>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ListInput from '../utils/ListInput.vue'
import OptionalInput from '../utils/OptionalInput.vue'

import ContestStageActionInput from './ContestStageActionInput.vue'
import ContestStageTagRulesInput from './ContestStageTagRulesInput.vue'

import type { IContestStage } from '@/types'

const { t } = useI18n()

const model = defineModel<IContestStage['settings']>({ required: true })

const keys: {
  [key in keyof IContestStage['settings']]: string
} = {
  registrationEnabled: 'registration-enabled',
  registrationAllowPublic: 'registration-allow-public',
  problemEnabled: 'problem-enabled',
  problemShowTags: 'problem-show-tags',
  problemAllowCreateSolution: 'problem-allow-create-solution',
  solutionEnabled: 'solution-enabled',
  solutionAllowSubmit: 'solution-allow-submit',
  solutionShowOther: 'solution-show-other',
  solutionShowDetails: 'solution-show-details',
  solutionShowOtherDetails: 'solution-show-other-details',
  solutionShowOtherData: 'solution-show-other-data',
  ranklistEnabled: 'ranklist-enabled',
  ranklistSkipCalculation: 'ranklist-skip-calculation',
  participantEnabled: 'participant-enabled',
  forceRunning: 'force-running',
  instanceEnabled: 'instance-enabled',
  instanceAllowCreate: 'instance-allow-create'
}

const entries = Object.entries(keys).map(([k, v]) => [
  k,
  t('contest-stage-settings.' + v),
  t('contest-stage-settings-hint.' + v)
]) as [keyof IContestStage['settings'], string, string][]
</script>

<i18n>
en:
  contest-stage-settings:
    registration-enabled: Registration Enabled
    registration-allow-public: Registration Allow Public
    problem-enabled: Problem Enabled
    problem-show-tags: Problem Show Tags
    problem-allow-create-solution: Problem Allow Create Solution
    solution-enabled: Solution Enabled
    solution-allow-submit: Solution Allow Submit
    solution-show-other: Solution Allow Other
    solution-show-details: Solution Show Details
    solution-show-other-details: Solution Allow Other Details
    solution-show-other-data: Solution Allow Other Data
    ranklist-enabled: Ranklist Enabled
    ranklist-skip-calculation: Skip Ranklist Calculation
    participant-enabled: Participant Enabled
    force-running: Force Running
    instance-enabled: Instance Enabled
    instance-allow-create: Instance Allow Create
  contest-stage-settings-hint:
    registration-enabled: Enable registration
    registration-allow-public: Allow public registration
    problem-enabled: Enable problem
    problem-show-tags: Show tags on problem
    problem-allow-create-solution: Allow create solution
    solution-enabled: Enable solution
    solution-allow-submit: Allow submit
    solution-show-other: Allow show other
    solution-show-details: Allow show details
    solution-show-other-details: Allow show other details
    solution-show-other-data: Allow show other data
    ranklist-enabled: Enable ranklist
    ranklist-skip-calculation: Skip ranklist calculation
    participant-enabled: Enable participant
    force-running: Force running
    instance-enabled: Enable instance
    instance-allow-create: Allow create instance
zh-Hans:
  contest-stage-settings:
    registration-enabled: 启用注册功能
    registration-allow-public: 允许公开注册
    problem-enabled: 启用题目
    problem-show-tags: 题目显示标签
    problem-allow-create-solution: 允许创建解答
    solution-enabled: 启用提交记录
    solution-allow-submit: 允许提交
    solution-show-other: 允许展示他人提交记录
    solution-show-details: 允许展示提交记录细节
    solution-show-other-details: 允许展示他人提交记录细节
    solution-show-other-data: 允许展示他人提交记录数据
    ranklist-enabled: 启用排名
    ranklist-skip-calculation: 跳过排名计算
    participant-enabled: 启用参赛者
    force-running: 强制为进行状态
    instance-enabled: 启用题目实例功能
    instance-allow-create: 允许创建题目实例
  contest-stage-settings-hint:
    registration-enabled: 开启后，选手才可以报名
    registration-allow-public: 关闭后，只允许分配了报名权限的用户报名
    problem-enabled: 开启后，选手才可查看题目
    problem-show-tags: 关闭后，题目隐藏标签
    problem-allow-create-solution: 开启后，选手才可以创建解答
    solution-enabled: 开启后，选手才可提交或查看提交
    solution-allow-submit: 开启后，选手才可以提交
    solution-show-other: 开启后，选手可以查看他人提交记录（仅状态）
    solution-show-details: 开启后，选手可以查看自己的提交详情
    solution-show-other-details: 开启后，选手可以查看他人提交详情
    solution-show-other-data: 开启后，选手可以查看他人提交内容（代码、数据等）
    ranklist-enabled: 开启后，选手才可以查看排行榜
    ranklist-skip-calculation: 开启后，本阶段提交不计入排行榜（订正模式）
    participant-enabled: 开启后，选手才可以查看参赛者列表
    force-running: 若不开启，当启用题目、允许提交、计算排行时方为进行状态
    instance-enabled: 开启后，选手才可以查看题目实例
    instance-allow-create: 开启后，选手才可以创建题目实例
</i18n>
