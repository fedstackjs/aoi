<template>
  <div class="u-grid u-grid-cols-2">
    <VCheckbox
      v-model="model.allowPublicSubmit"
      :label="t('problem.settings.allow-public-submit')"
    />
    <VTextField
      type="number"
      v-model.number="model.maxSolutionCount"
      :label="t('problem.settings.max-solution-count')"
    />
  </div>
</template>

<script setup lang="ts">
import type { IProblemSettings } from '@/types'
import { useI18n } from 'vue-i18n'

const model = defineModel<IProblemSettings>({ required: true })
const { t } = useI18n()
</script>
