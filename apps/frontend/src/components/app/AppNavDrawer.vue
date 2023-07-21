<template>
  <VNavigationDrawer v-model="appState.navBar">
    <VList nav>
      <AppNavOrgSelector />
      <VDivider />
      <VListItem v-for="(link, i) of links" :key="i" v-bind="link" />
    </VList>
    <template #append>
      <VDivider />
      <div class="u-flex">
        <div class="u-flex-1"></div>
        <LocaleSelectBtn />
      </div>
    </template>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import { useAppState } from '@/stores/app'
import type { VListItem } from 'vuetify/components'
import { useI18n } from 'vue-i18n'
import LocaleSelectBtn from '@/components/locale/LocaleSelectBtn.vue'
import { computed } from 'vue'
import AppNavOrgSelector from './AppNavOrgSelector.vue'

const { t } = useI18n()
const appState = useAppState()

const orgItems = () => {
  if (!appState.orgId) return []
  return [
    { prependIcon: 'mdi-list-box', to: '/problem', title: t('problems') },
    { prependIcon: 'mdi-balloon', to: '/contest', title: t('contests') },
    { prependIcon: 'mdi-timer-sand', to: '/submission', title: t('submissions') },
    { prependIcon: 'mdi-account-multiple', to: '/group', title: t('groups') },
    { prependIcon: 'mdi-chat', to: '/discussion', title: t('discussion') }
  ].map((item) => ({
    ...item,
    to: `/org/${appState.orgId}${item.to}`
  }))
}

const links = computed(() => [
  { prependIcon: 'mdi-home', to: '/', title: t('home') },
  ...orgItems(),
  { prependIcon: 'mdi-help', to: '/about', title: t('about') }
])
</script>
