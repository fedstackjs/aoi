<template>
  <VAppBar border>
    <VAppBarNavIcon @click="appState.navBar = !appState.navBar" />
    <VAppBarTitle>{{ appState.title }}</VAppBarTitle>

    <VSpacer></VSpacer>

    <VToolbarItems>
      <AppBarUserMenu v-if="appState.loggedIn" />
      <VBtn v-else color="blue-darken-1" to="/signin">
        {{ t('signin') }}
      </VBtn>
    </VToolbarItems>
  </VAppBar>
</template>

<script setup lang="ts">
import { useAppState } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import AppBarUserMenu from './AppBarUserMenu.vue'

const { t } = useI18n()
const appState = useAppState()
</script>
