<template>
  <VTextField v-model="model.name" :label="t('term.name')" />
  <VTextField type="email" v-model="model.email" :label="t('term.email')" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const model = defineModel<{ name: string; email: string }>({ required: true })
const { t } = useI18n()
</script>
