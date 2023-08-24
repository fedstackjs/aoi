<template>
  <VNavigationDrawer v-model="appState.navBar">
    <VList nav>
      <AppNavOrgSelector />
      <VListItem v-for="(link, i) of links" :key="i" v-bind="link" />
    </VList>
    <template #append>
      <VDivider />
      <div class="u-flex u-items-center">
        <VBtn variant="text" class="text-none px-2" color="text" rounded="sm">
          <div>
            <div class="u-text-sm">AoiUI v{{ appBuildInfo.version }}</div>
            <div class="u-text-xs u-font-mono u-text-blue-900">
              {{ appBuildInfo.hash }}@{{ appBuildInfo.branch }}
            </div>
          </div>
        </VBtn>
        <div class="px-2"></div>
        <div class="u-flex-1"></div>
        <LocaleSelectBtn />
      </div>
    </template>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import type { VListItem } from 'vuetify/components'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useAppState } from '@/stores/app'
import LocaleSelectBtn from '@/components/locale/LocaleSelectBtn.vue'
import { appBuildInfo } from '@/utils/build'
import AppNavOrgSelector from './AppNavOrgSelector.vue'

const { t } = useI18n()
const appState = useAppState()

const orgItems = () => {
  if (!appState.orgId) return []
  return [
    { prependIcon: 'mdi-list-box', to: '/problem', title: t('pages.problems') },
    { prependIcon: 'mdi-balloon', to: '/contest', title: t('pages.contests') },
    { prependIcon: 'mdi-clipboard-text-outline', to: '/plan', title: t('pages.plans') },
    { prependIcon: 'mdi-account-multiple', to: '/group', title: t('pages.groups') },
    { prependIcon: 'mdi-cog', to: '/admin', title: t('pages.admin') }
  ].map((item) => ({
    ...item,
    to: `/org/${appState.orgId}${item.to}`
  }))
}

const debugItems = () => {
  if (!appState.debug) return []
  return [{ prependIcon: 'mdi-bug', to: '/debug', title: 'Debug Tools' }]
}

const links = computed(() => [
  ...orgItems(),
  { prependIcon: 'mdi-help', to: '/about', title: t('pages.about') },
  ...debugItems()
])
</script>
