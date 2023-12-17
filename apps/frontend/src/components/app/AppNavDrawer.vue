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
import { useAppState } from '@/stores/app'
import LocaleSelectBtn from '@/components/locale/LocaleSelectBtn.vue'
import { appBuildInfo } from '@/utils/build'
import AppNavOrgSelector from './AppNavOrgSelector.vue'
import { useAppNavMenu } from '@/utils/menus'

const appState = useAppState()

const links = useAppNavMenu()
</script>
