<template>
  <VTextField v-model="model.defaultOrg" :label="t('default-org-id')" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const model = defineModel<{ defaultOrg: string }>({ required: true })
const { t } = useI18n()
</script>

<i18n>
en:
  default-org-id: Default Organization ID
zh-Hans:
  default-org-id: 默认组织 ID
</i18n>
