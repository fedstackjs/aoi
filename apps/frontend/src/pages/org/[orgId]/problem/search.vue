<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.problems')">
          <ProblemList :orgId="orgId" :search="search" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProblemList from '@/components/problem/ProblemList.vue'
import { useRouteQuery } from '@vueuse/router'

defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.problems')))

const search = useRouteQuery('search', '')
</script>
