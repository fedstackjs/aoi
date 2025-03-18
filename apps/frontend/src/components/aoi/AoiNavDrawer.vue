<template>
  <VNavigationDrawer v-model="appState.navBar">
    <VList nav>
      <AoiNavOrgSelector />
      <VListItem v-for="(link, i) of links" :key="i" v-bind="link" />
    </VList>
    <template #append>
      <VDivider />
      <div class="u-flex u-items-center">
        <VBtn variant="text" class="text-none text-left px-2" color="text" rounded="sm">
          <div>
            <div class="u-text-sm u-font-mono u-tracking-tighter">
              AOI-UI v{{ appBuildInfo.version }}
            </div>
            <div class="u-text-xs u-font-mono u-tracking-tighter u-text-blue-900">
              {{ appBuildInfo.hash }}
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
import AoiNavOrgSelector from './AoiNavOrgSelector.vue'

import LocaleSelectBtn from '@/components/locale/LocaleSelectBtn.vue'
import { useAppState } from '@/stores/app'
import { appBuildInfo } from '@/utils/build'
import { useAppNavMenu } from '@/utils/menus'

const appState = useAppState()

const links = useAppNavMenu()
</script>
