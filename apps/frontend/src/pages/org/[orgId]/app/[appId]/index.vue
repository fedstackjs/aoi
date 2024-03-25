<template>
  <MarkdownRenderer :md="app.description" class="u-p-4" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'
import { useAppData } from '@/utils/app/inject'
import { withTitle } from '@/utils/title'

defineProps<{
  orgId: string
  appId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.apps')))

const app = useAppData()
</script>
