<template>
  <VContainer>
    <VRow justify="center">
      <VCol>
        <VAlert type="error" :value="true">
          {{ t('msg.not-found') }}
        </VAlert>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
