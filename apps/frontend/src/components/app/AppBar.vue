<template>
  <VAppBar border>
    <VAppBarNavIcon @click="appState.navBar = !appState.navBar" />
    <VToolbarItems>
      <VBtn to="/" rounded="lg" :active="false">
        <template #prepend>
          <VIcon size="48"><AppLogo /></VIcon>
        </template>
        <div class="text-none u-pl-4 u-font-mono u-text-3xl">
          {{ appName }}
        </div>
      </VBtn>
    </VToolbarItems>
    <VAppBarTitle>{{ appState.title }}</VAppBarTitle>
    <TimeLabel />

    <VSpacer></VSpacer>

    <SearchBox v-if="appState.orgId" :org-id="appState.orgId" />
    <VToolbarItems v-if="appState.loggedIn">
      <AppBarAddMenu />
      <AppBarUserMenu />
    </VToolbarItems>
    <VToolbarItems v-else>
      <VBtn color="blue-darken-1" to="/signin">
        {{ t('pages.signin') }}
      </VBtn>
    </VToolbarItems>
  </VAppBar>
</template>

<script setup lang="ts">
import { useAppState } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import AppBarUserMenu from './AppBarUserMenu.vue'
import AppBarAddMenu from './AppBarAddMenu.vue'
import AppLogo from './AppLogo.vue'
import TimeLabel from '../homepage/TimeLabel.vue'
import SearchBox from '../homepage/SearchBox.vue'

const { t } = useI18n()
const appState = useAppState()

const appName = __APP_NAME__
</script>
