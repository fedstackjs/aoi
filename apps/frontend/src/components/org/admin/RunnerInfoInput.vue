<template>
  <VTextField v-model="model.name" :label="t('term.name')" />
  <VCombobox v-model="model.labels" :label="t('term.runner-label')" multiple chips />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const model = defineModel<{
  labels: string[]
  name: string
}>({ required: true })
</script>
