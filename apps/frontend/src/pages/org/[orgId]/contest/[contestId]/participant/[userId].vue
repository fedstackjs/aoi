<template>
  <VCardText>
    <PrincipalProfile :principal-id="userId" />
  </VCardText>
  <VDivider />
  <SettingsEditor v-if="admin" :endpoint="`contest/${contestId}/participant/admin/${userId}`">
    <template v-slot="scoped">
      <VCombobox v-model="scoped.value.tags" :label="t('term.tags')" multiple chips />
    </template>
  </SettingsEditor>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { IContestDTO } from '@/components/contest/types'
import { useContestCapability } from '@/utils/contest/inject'
import PrincipalProfile from '@/components/utils/PrincipalProfile.vue'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  userId: string
}>()

const { t } = useI18n()
const admin = useContestCapability('admin')
</script>
