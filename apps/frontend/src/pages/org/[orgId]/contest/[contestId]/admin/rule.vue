<template>
  <VCard :title="t('term.rules')" variant="flat">
    <RulesEditor :endpoint="`contest/${contestId}/admin/rule`" id="contest" />
  </VCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import RulesEditor from '@/components/common/RulesEditor.vue'
import type { IContestDTO } from '@/components/contest/types'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const { t } = useI18n()
</script>
