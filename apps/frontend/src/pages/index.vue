<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('home')">
          <VCardText>
            <p>欢迎来到AOI平台，请选择想进入的组织</p>
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

withTitle(computed(() => t('home')))
</script>
