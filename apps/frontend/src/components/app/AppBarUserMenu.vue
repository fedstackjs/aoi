<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <VBtn v-bind="props" :loading="userInfo.isLoading.value" class="text-none">
        <template #prepend>
          <VAvatar>
            <AppGravatar :email="userInfo.state.value?.email ?? ''" />
          </VAvatar>
        </template>
        {{ userInfo.state.value?.name }}
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
import { logout as _logout, http } from '@/utils/http'
import { useAsyncState } from '@vueuse/core'
import AppGravatar from './AppGravatar.vue'
import { useAppState } from '@/stores/app'

const router = useRouter()
const { t } = useI18n()
const app = useAppState()

const userInfo = useAsyncState(async () => {
  const resp = await http.get(`user/${app.userId}/profile`)
  const user = await resp.json<{
    name: string
    realname: string
    email: string
  }>()
  return user
}, null as never)

const userMenu = computed(() => [
  { prependIcon: 'mdi-account', to: `/user/${app.userId}`, title: t('user-info'), exact: true },
  { prependIcon: 'mdi-cog', to: `/user/${app.userId}/settings`, title: t('user-settings') },
  { prependIcon: 'mdi-logout', action: logout, title: t('logout') }
])

function logout() {
  _logout()
  router.replace('/')
}
</script>
