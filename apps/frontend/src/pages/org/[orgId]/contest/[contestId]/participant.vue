<template>
  <VRow>
    <VCol cols="auto">
      <VTabs direction="vertical" color="primary">
        <VTab prepend-icon="mdi-format-list-bulleted-square" :to="rel('')" exact>
          {{ t('participant.participant-list') }}
        </VTab>
        <VTab prepend-icon="mdi-cog" :to="rel('admin')" v-if="admin">
          {{ t('participant.participant-admin') }}
        </VTab>
      </VTabs>
    </VCol>
    <VCol>
      <VCard class="flex-grow-1">
        <RouterView :contest="contest" />
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { IContestDTO } from '@/components/contest/types'
import { useContestCapability } from '@/utils/contest/inject'

const props = defineProps<{
  orgId: string
  contestId: string
  contest: IContestDTO
}>()

const { t } = useI18n()

const admin = useContestCapability('admin')

const rel = (to: string) => `/org/${props.orgId}/contest/${props.contestId}/participant/${to}`
</script>

<i18n>
en:
  participant:
    participant-list: Participant List
    participant-admin: Participant Admin
zh-Hans:
  participant:
    participant-list: 参赛者列表
    participant-admin: 参赛者管理
</i18n>
