<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard>
          <InstanceList :org-id="orgId" :self-only="!isAdmin" />
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import InstanceList from '@/components/instance/InstanceList.vue'
import { useOrgCapability } from '@/utils/capability'
import { withTitle } from '@/utils/title'

defineProps<{
  orgId: string
}>()

const { t } = useI18n()

const isAdmin = useOrgCapability('admin')

withTitle(computed(() => t('pages.instances')))
</script>
