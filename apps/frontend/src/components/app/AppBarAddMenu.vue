<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <VBtn v-bind="props" icon="mdi-plus" class="text-none" />
    </template>
    <VList>
      <VListItem v-for="(item, i) in userMenu" :key="i" v-bind="item" />
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useAppState } from '@/stores/app'

const { t } = useI18n()
const appState = useAppState()

const orgMenu = () => {
  if (!appState.orgId) return []
  return [
    { prependIcon: 'mdi-notebook', title: t('new-problem'), to: '/problem/new' },
    { prependIcon: 'mdi-trophy', title: t('new-contest'), to: '/contest/new' },
    { prependIcon: 'mdi-clipboard-clock', title: t('new-plan'), to: '/plan/new' }
  ].map((item) => ({
    ...item,
    to: `/org/${appState.orgId}${item.to}`
  }))
}

const userMenu = computed(() => [
  { prependIcon: 'mdi-account-group', title: t('new-organization'), to: '/org/new' },
  ...orgMenu()
])
</script>

<i18n global>
en:
  new-organization: New organization
  new-problem: New problem
  new-contest: New contest
  new-plan: New plan
zhHans:
  new-organization: 新建组织
  new-problem: 新建题目
  new-contest: 新建比赛
  new-plan: 新建计划
</i18n>
