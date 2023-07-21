<template>
  <VAppBar border>
    <VAppBarNavIcon @click="appState.navBar = !appState.navBar" />
    <VAppBarTitle>{{ appState.title }}</VAppBarTitle>

    <VSpacer></VSpacer>

    <VToolbarItems v-if="appState.loggedIn">
      <AppBarAddMenu />
      <AppBarUserMenu />
    </VToolbarItems>
    <VToolbarItems v-else>
      <VBtn color="blue-darken-1" to="/signin">
        {{ t('signin') }}
      </VBtn>
    </VToolbarItems>
  </VAppBar>
</template>

<script setup lang="ts">
import { useAppState } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import AppBarUserMenu from './AppBarUserMenu.vue'
import AppBarAddMenu from './AppBarAddMenu.vue'

const { t } = useI18n()
const appState = useAppState()
</script>
