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
      <VBtn color="red" variant="elevated" @click="deletePlan()">
        {{ t('action.delete') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import PlanSettingsInput from '@/components/plan/PlanSettingsInput.vue'
import type { IPlanDTO } from '@/components/plan/types'
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
  planId: string
  plan: IPlanDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
const router = useRouter()

async function deletePlan() {
  await http.delete(`plan/${props.planId}/admin`)
  router.push(`/org/${props.orgId}/plan`)
  emit('updated')
}
</script>
