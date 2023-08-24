<template>
  <VBtnToggle v-model="model" variant="outlined">
    <VBtn>{{ t('auth.public') }}</VBtn>
    <VBtn>{{ t('auth.restricted') }}</VBtn>
    <VBtn>{{ t('auth.private') }}</VBtn>
  </VBtnToggle>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const model = defineModel<number>({ required: true })
</script>
