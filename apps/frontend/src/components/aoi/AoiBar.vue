<template>
  <VAppBar border>
    <VAppBarNavIcon @click="appState.navBar = !appState.navBar" />
    <VToolbarItems>
      <VBtn to="/" rounded="lg" :active="false">
        <template #prepend>
          <VIcon size="48"><AoiLogo /></VIcon>
        </template>
        <div class="text-none u-pl-4 u-font-mono u-text-3xl">
          {{ appName }}
        </div>
      </VBtn>
    </VToolbarItems>
    <VAppBarTitle>{{ appState.title }}</VAppBarTitle>
    <TimeLabel v-if="showCountdown" />

    <VSpacer></VSpacer>

    <SearchBox v-if="appState.orgId" :org-id="appState.orgId" />
    <VToolbarItems v-if="appState.loggedIn">
      <AoiBarAddMenu />
      <AoiBarUserMenu />
    </VToolbarItems>
    <VToolbarItems v-else>
      <VBtn color="blue-darken-1" to="/auth/login" exact>
        {{ t('pages.signin') }}
      </VBtn>
    </VToolbarItems>
    <template #extension v-if="appState.navBarExtension">
      <component :is="appState.navBarExtension[0]" v-bind="appState.navBarExtension[1].value" />
    </template>
  </VAppBar>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import SearchBox from '../homepage/SearchBox.vue'
import TimeLabel from '../homepage/TimeLabel.vue'

import AoiBarAddMenu from './AoiBarAddMenu.vue'
import AoiBarUserMenu from './AoiBarUserMenu.vue'
import AoiLogo from './AoiLogo.vue'

import { useAppState } from '@/stores/app'
import { appName, showCountdown } from '@/utils/flags'

const { t } = useI18n()
const appState = useAppState()
</script>
