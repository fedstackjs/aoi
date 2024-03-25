<template>
  <div class="d-flex flex-row">
    <VTabs direction="vertical" color="primary">
      <VTab prepend-icon="mdi-cog" :to="rel('')" exact>
        {{ t('term.settings') }}
      </VTab>
      <VTab prepend-icon="mdi-text" :to="rel('content')">
        {{ t('term.content') }}
      </VTab>
      <VTab prepend-icon="mdi-lock" :to="rel('access')">
        {{ t('term.access') }}
      </VTab>
    </VTabs>
    <VDivider vertical />
    <RouterView class="flex-grow-1" @updated="emit('updated')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { withI18nTitle } from '@/utils/title'

const props = defineProps<{
  orgId: string
  appId: string
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()

withI18nTitle('pages.apps')

const rel = (to: string) => `/org/${props.orgId}/app/${props.appId}/admin/${to}`
</script>
