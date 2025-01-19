<template>
  <VTextField v-model="model.slug" :label="t('term.slug')" />
  <VTextField v-model="model.score" :label="t('term.score')" type="number" />
  <VTextField v-model="model.solutionCountLimit" :label="t('solution-count-limit')" type="number" />
  <VTextField v-model="model.showAfter" :label="t('common.show-after')" type="number" />
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
  <VCheckbox v-model="model.disableSubmit" :label="t('disable-submit')" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import ListInput from '../utils/ListInput.vue'
import OptionalInput from '../utils/OptionalInput.vue'

import ContestStageActionInput from './ContestStageActionInput.vue'

import type { IContestProblemSettings } from '@/types'

const { t } = useI18n()
const model = defineModel<IContestProblemSettings>({ required: true })
</script>
<i18n>
en:
  solution-count-limit: Solution Count Limit
  disable-submit: Disable Submit
zh-Hans:
  solution-count-limit: 提交记录数量限制
  disable-submit: 禁止提交
</i18n>
