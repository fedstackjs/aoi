<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard title="关于我们">
          <VCardText>
            <p>关于...</p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

withTitle(computed(() => t('about')))
</script>
