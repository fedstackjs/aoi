<template>
  <VNavigationDrawer v-model="appState.navBar">
    <VList nav>
      <VListItem v-for="(link, i) of links" :key="i" v-bind="link" />
    </VList>
    <template #append>
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

const { t } = useI18n()
const appState = useAppState()

const links = computed(() => [
  { prependIcon: 'mdi-home', to: '/', title: t('home') },
  { prependIcon: 'mdi-help', to: '/about', title: t('about') }
])
</script>
