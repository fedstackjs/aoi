<template>
  <VCardText>
    <PrincipalProfile :principal-id="userId" />
  </VCardText>
  <template v-if="admin">
    <VDivider />
    <SettingsEditor :endpoint="`contest/${contestId}/participant/admin/${userId}`">
      <template v-slot="scoped">
        <VCombobox v-model="scoped.value.tags" :label="t('term.tags')" multiple chips />
      </template>
    </SettingsEditor>
    <VDivider />
    <VCardActions>
      <VBtn
        :to="`/org/${orgId}/contest/${contestId}/solution?userId=${userId}`"
        :text="t('goto-solutions')"
      />
      <VBtn :to="`/user/${userId}`" :text="t('goto-user')" />
    </VCardActions>
  </template>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { IContestDTO } from '@/components/contest/types'
import PrincipalProfile from '@/components/utils/PrincipalProfile.vue'
import SettingsEditor from '@/components/utils/SettingsEditor.vue'
import { useContestCapability, useContestSettings } from '@/utils/contest/inject'

defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
  userId: string
}>()

const { t } = useI18n()
const admin = useContestCapability('admin')
</script>

<i18n>
en:
  goto-solutions: Go to solutions
  goto-user: Go to user
zh-Hans:
  goto-solutions: 查看提交
  goto-user: 查看用户
</i18n>
