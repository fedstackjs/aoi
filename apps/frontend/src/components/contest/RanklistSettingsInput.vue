<template>
  <VTextField v-model.number="model.showBefore" :label="t('common.show-before')" type="number" />
  <VTextField v-model.number="model.showAfter" :label="t('common.show-after')" type="number" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const model = defineModel<{
  showBefore: number
  showAfter: number
}>({ required: true })
</script>
