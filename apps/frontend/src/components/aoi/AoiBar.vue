<template>
  <VAppBar border :density="appState.navBarExtension ? 'compact' : 'default'">
    <VAppBarNavIcon @click="appState.navBar = !appState.navBar" />
    <VToolbarItems>
      <VBtn to="/" rounded="lg" :active="false">
        <template #prepend>
          <VIcon :size="appState.navBarExtension ? '32' : '48'">
            <AoiLogo />
          </VIcon>
        </template>
        <div
          v-if="mdAndUp"
          class="text-none u-pl-4 u-font-mono"
          :class="[appState.navBarExtension ? 'u-text-2xl' : 'u-text-3xl']"
        >
          {{ appName }}
        </div>
      </VBtn>
    </VToolbarItems>
    <VAppBarTitle>{{ appState.title }}</VAppBarTitle>
    <TimeLabel v-if="showCountdown" />

    <VSpacer></VSpacer>

    <SearchBox v-if="mdAndUp && appState.orgId" />
    <VToolbarItems v-if="appState.loggedIn">
      <AoiBarAddMenu />
      <AoiBarUserMenu :dense="!mdAndUp" />
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
import { useDisplay } from 'vuetify'

import SearchBox from '../homepage/SearchBox.vue'
import TimeLabel from '../homepage/TimeLabel.vue'

import AoiBarAddMenu from './AoiBarAddMenu.vue'
import AoiBarUserMenu from './AoiBarUserMenu.vue'
import AoiLogo from './AoiLogo.vue'

import { useAppState } from '@/stores/app'
import { appName, showCountdown } from '@/utils/flags'

const { t } = useI18n()
const appState = useAppState()
const { mdAndUp } = useDisplay()
</script>
