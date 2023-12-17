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
    <RouterView class="flex-grow-1" :plan="plan" @updated="emit('updated')" />
  </div>
</template>

<script setup lang="ts">
import type { IPlanDTO } from '@/components/plan/types'
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.plans')))

const rel = (to: string) => `/org/${props.orgId}/plan/${props.planId}/admin/${to}`
</script>
