<template>
  <VCard variant="flat">
    <VCardText>
      <VTextField :label="t('term.name')" />
      <VTextField :label="t('term.email')" type="email" />
    </VCardText>
    <VCardActions>
      <VBtn color="primary">{{ t('action.save') }}</VBtn>
      <VBtn color="error">{{ t('action.reset') }}</VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
