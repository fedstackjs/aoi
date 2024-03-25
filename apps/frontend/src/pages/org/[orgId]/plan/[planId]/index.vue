<template>
  <MarkdownRenderer :md="plan.description" class="u-p-4" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { IPlanDTO } from '@/components/plan/types'
import MarkdownRenderer from '@/components/utils/MarkdownRenderer.vue'
import { withTitle } from '@/utils/title'

defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.plans')))
</script>
