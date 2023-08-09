<template>
  <VCard flat :title="t('problem-settings')">
    <VDivider />
    <AccessLevelEditor
      :access-level="problem.accessLevel"
      :prefix="`problem/${problemId}/admin/accessLevel`"
      @updated="emit('updated')"
    />
    <VDivider />
    <VCardSubtitle>
      {{ t('danger-zone') }}
    </VCardSubtitle>
    <VCardText>
      <VBtn color="red" variant="elevated">
        {{ t('delete') }}
      </VBtn>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import type { IProblemDTO } from '@/components/problem/types'
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import { useI18n } from 'vue-i18n'

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

<i18n>
zhHans:
  problem-settings: 设置
en:
  problem-settings: Settings
</i18n>
