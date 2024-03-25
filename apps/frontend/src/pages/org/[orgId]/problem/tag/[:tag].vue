<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.problems')">
          <ProblemList :orgId="orgId" :tag="tag" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ProblemList from '@/components/problem/ProblemList.vue'
import { withTitle } from '@/utils/title'

defineProps<{
  orgId: string
  tag: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.problems')))
</script>
