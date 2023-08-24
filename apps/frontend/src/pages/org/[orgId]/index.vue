<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard>
          <OrgInfoCard :org-id="props.orgId" />
        </VCard>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <RecentContestsCard :org-id="props.orgId" />
      </VCol>
      <VCol>
        <RecentPlansCard :org-id="props.orgId" />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import OrgInfoCard from '@/components/org/home/OrgInfoCard.vue'
import RecentContestsCard from '@/components/org/home/RecentContestsCard.vue'
import RecentPlansCard from '@/components/org/home/RecentPlansCard.vue'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

withTitle(computed(() => t('pages.home')))
</script>
