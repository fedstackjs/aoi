<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.apps')">
          <AppList :orgId="orgId" :tag="tag" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import AppList from '@/components/app/AppList.vue'
import { withI18nTitle, withTitle } from '@/utils/title'

defineProps<{
  orgId: string
  tag: string
}>()

const { t } = useI18n()

withI18nTitle('pages.apps')
</script>
