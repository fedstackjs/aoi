<template>
  <VCard flat>
    <div class="d-flex flex-row">
      <VTabs v-model="currentTab" direction="vertical" color="primary">
        <VTab :to="rel('')" exact>
          <VIcon start> mdi-cog </VIcon>
          {{ t('term.settings') }}
        </VTab>
        <VTab :to="rel('content')">
          <VIcon start>mdi-text</VIcon>
          {{ t('term.content') }}
        </VTab>
        <VTab :to="rel('access')">
          <VIcon start> mdi-lock </VIcon>
          {{ t('term.access') }}
        </VTab>
        <VTab prepend-icon="mdi-code-tags" :to="rel('rule')">
          {{ t('term.rules') }}
        </VTab>
      </VTabs>
      <VDivider vertical />
      <RouterView class="flex-grow-1" :problem="problem" @updated="emit('updated')" />
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { IProblemDTO } from '@/components/problem/types'

const props = defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()

const currentTab = ref('settings')
const rel = (to: string) => `/org/${props.orgId}/problem/${props.problemId}/admin/${to}`
</script>
