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
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouteQuery } from '@vueuse/router'
import AppList from '@/components/app/AppList.vue'

defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.apps')))

const search = useRouteQuery('search', '')
</script>
