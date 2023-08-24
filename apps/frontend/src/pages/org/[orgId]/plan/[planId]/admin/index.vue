<template>
  <VCard flat :title="t('term.settings')">
    <VDivider />
    <SettingsEditor :endpoint="`plan/${planId}/admin/settings`">
      <template v-slot="scoped">
        <PlanSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VDivider />
    <AccessLevelEditor
      :access-level="plan.accessLevel"
      :prefix="`plan/${planId}/admin/accessLevel`"
      @updated="emit('updated')"
    />
    <VDivider />
    <VCardSubtitle>
      {{ t('term.danger-zone') }}
    </VCardSubtitle>
    <VCardActions>
      <VBtn color="red" variant="elevated">
        {{ t('action.delete') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import PlanSettingsInput from '@/components/plan/PlanSettingsInput.vue'
import type { IPlanDTO } from '@/components/plan/types'
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
</script>
