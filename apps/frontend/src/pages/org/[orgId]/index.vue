<template>
  <VContainer>
    <VRow>
      <VCol>
        <VCard :title="t('pages.home')">
          <VCardText>
            <MonacoEditor language="json" :model-value="JSON.stringify(route, null, 2)" />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import MonacoEditor from '@/components/utils/MonacoEditor.vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

defineProps<{
  orgId: string
}>()

const route = useRoute()
const { t } = useI18n()
</script>
