<template>
  <VCard flat :title="t('problem-settings')">
    <VDivider />
    <AccessLevelEditor
      :access-level="contest.accessLevel"
      :prefix="`contest/${contestId}/admin/accessLevel`"
      @updated="emit('updated')"
    />
    <VDivider />
    <VCardSubtitle>
      {{ t('danger-zone') }}
    </VCardSubtitle>
    <VCardActions>
      <VBtn color="red" variant="elevated">
        {{ t('delete') }}
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import type { IContestDTO } from '@/components/contest/types'
import AccessLevelEditor from '@/components/utils/AccessLevelEditor.vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
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
