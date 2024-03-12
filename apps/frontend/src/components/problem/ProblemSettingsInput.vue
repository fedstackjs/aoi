<template>
  <div class="u-grid u-grid-cols-2">
    <VCheckbox v-model="model.allowPublicSubmit" :label="t('allow-public-submit')" />
    <VTextField
      type="number"
      v-model.number="model.maxSolutionCount"
      :label="t('max-solution-count')"
    />
    <VCheckbox v-model="model.solutionShowOther" :label="t('solution-show-other')" />
    <VCheckbox v-model="model.solutionShowDetails" :label="t('solution-show-details')" />
    <VCheckbox v-model="model.solutionShowOtherDetails" :label="t('solution-show-other-details')" />
    <VCheckbox v-model="model.solutionShowOtherData" :label="t('solution-show-other-data')" />
  </div>
</template>

<script setup lang="ts">
import type { IProblemSettings } from '@/types'
import { useI18n } from 'vue-i18n'

const model = defineModel<IProblemSettings>({ required: true })
const { t } = useI18n()
</script>

<i18n>
en:
  allow-public-submit: Allow public submit
  max-solution-count: Max solution count
  solution-show-other: Show other solution
  solution-show-details: Show solution details
  solution-show-other-details: Show other solution details
  solution-show-other-data: Show other solution data
zh-Hans:
  allow-public-submit: 允许公开提交
  max-solution-count: 最大提交记录数量
  solution-show-other: 显示其他提交
  solution-show-details: 显示提交详情
  solution-show-other-details: 显示他人提交详情
  solution-show-other-data: 显示他人提交数据
</i18n>
