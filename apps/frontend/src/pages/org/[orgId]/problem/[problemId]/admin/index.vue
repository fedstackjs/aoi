<template>
  <VCard flat :title="t('term.settings')">
    <VDivider />
    <SettingsEditor :endpoint="`problem/${problemId}/admin/settings`">
      <template v-slot="scoped">
        <ProblemSettingsInput v-model="scoped.value" />
      </template>
    </SettingsEditor>
    <VDivider />
    <AccessLevelEditor
      :access-level="problem.accessLevel"
      :prefix="`problem/${problemId}/admin/accessLevel`"
      @updated="emit('updated')"
    />
    <VDivider />
    <VCardSubtitle>
      {{ t('term.danger-zone') }}
    </VCardSubtitle>
    <VCardText>
      <VBtn color="red" variant="elevated">
        {{ t('action.delete') }}
      </VBtn>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import { useI18n } from 'vue-i18n'
import type { IProblemDTO } from '@/components/problem/types'
import ProblemSettingsInput from '@/components/problem/ProblemSettingsInput.vue'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'

defineProps<{
  orgId: string
  problemId: string
  problem: IProblemDTO
}>()

const emit = defineEmits<{
  (ev: 'updated'): void
}>()

const { t } = useI18n()
</script>
