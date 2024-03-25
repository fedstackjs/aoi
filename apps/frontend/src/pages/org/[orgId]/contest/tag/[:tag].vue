<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.contests')">
          <ContestList :orgId="orgId" :tag="tag" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ContestList from '@/components/contest/ContestList.vue'
import { withTitle } from '@/utils/title'

defineProps<{
  orgId: string
  tag: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.contest')))
</script>
