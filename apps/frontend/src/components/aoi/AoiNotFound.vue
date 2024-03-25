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

import { withI18nTitle } from '@/utils/title'

const { t } = useI18n()
withI18nTitle('pages.not-found')
</script>
