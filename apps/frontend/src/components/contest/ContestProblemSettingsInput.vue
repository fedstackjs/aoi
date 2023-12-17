<template>
  <VTextField v-model="model.slug" :label="t('term.slug')" />
  <VTextField v-model="model.score" :label="t('term.score')" type="number" />
  <VTextField v-model="model.solutionCountLimit" :label="t('solution-count-limit')" type="number" />
  <VTextField v-model="model.showAfter" :label="t('common.show-after')" type="number" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const model = defineModel<{
  score: number
  slug: string
  solutionCountLimit: number
  showAfter: number
}>({ required: true })
</script>
<i18n>
en:
  solution-count-limit: Solution Count Limit
zh-Hans:
  solution-count-limit: 提交记录数量限制
</i18n>
