<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard>
          <SolutionList :org-id="orgId" :self-only="!isAdmin" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { withTitle } from '@/utils/title'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SolutionList from '@/components/solution/global/SolutionList.vue'
import { useOrgCapability } from '@/utils/capability'

const props = defineProps<{
  orgId: string
}>()

const { t } = useI18n()

const isAdmin = useOrgCapability('admin')

withTitle(computed(() => t('pages.solutions')))
</script>
