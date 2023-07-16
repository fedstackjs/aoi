<template>
  <VAppBar border>
    <VAppBarNavIcon @click="appState.navBar = !appState.navBar" />
    <VAppBarTitle>{{ appState.title }}</VAppBarTitle>

    <VSpacer></VSpacer>

    <VBtn color="blue-darken-1" v-if="!appState.loggedIn" to="/signin">
      {{ t('signin') }}
    </VBtn>

    <VMenu open-on-hover v-else>
      <template v-slot:activator="{ props }">
        <VBtn v-bind="props">
          {{ appState.userName }}
        </VBtn>
      </template>
      <VList>
        <VListItem v-for="(item, i) in userMenu" :key="i" v-bind="item" @click="item.action" />
      </VList>
    </VMenu>
  </VAppBar>
</template>

<script setup lang="ts">
import { useAppState } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout as _logout } from '@/utils/http'

const router = useRouter()
const { t } = useI18n()
const appState = useAppState()

const userMenu = computed(() => [{ prependIcon: 'mdi-logout', action: logout, title: t('logout') }])

function logout() {
  _logout()
  router.replace('/')
}
</script>
