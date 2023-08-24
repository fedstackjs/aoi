<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <VBtn v-bind="props" :loading="userInfo.isLoading.value" class="text-none">
        <template #prepend>
          <VAvatar>
            <AppGravatar :email="userInfo.state.value?.profile.email ?? ''" />
          </VAvatar>
        </template>
        {{ userInfo.state.value?.profile.name }}
      </VBtn>
    </template>
    <VList>
      <VListItem v-for="(item, i) in userMenu" :key="i" v-bind="item" @click="item.action" />
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout as _logout } from '@/utils/http'
import AppGravatar from './AppGravatar.vue'
import { useAppState } from '@/stores/app'

const router = useRouter()
const { t } = useI18n()
const app = useAppState()
const userInfo = app.user

const userMenu = computed(() => [
  {
    prependIcon: 'mdi-account',
    to: `/user/${app.userId}`,
    title: t('pages.user-info'),
    exact: true
  },
  { prependIcon: 'mdi-cog', to: `/user/${app.userId}/settings`, title: t('pages.user-settings') },
  { prependIcon: 'mdi-logout', action: logout, title: t('pages.logout') }
])

function logout() {
  _logout()
  router.replace('/')
}
</script>
