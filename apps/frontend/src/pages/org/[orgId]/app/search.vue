<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.apps')">
          <AppList :orgId="orgId" :search="search" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppList from '@/components/app/AppList.vue'
import { withTitle } from '@/utils/title'

defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.apps')))

const search = useRouteQuery('search', '')
</script>
