<template>
  <VMenu>
    <template v-slot:activator="{ props }">
      <VBtn v-bind="props" :loading="userInfo.isLoading.value" class="text-none">
        <template #prepend>
          <VAvatar>
            <AoiGravatar :email="userInfo.state.value?.profile.email ?? ''" />
          </VAvatar>
        </template>
        {{ dense ? '' : userInfo.state.value?.profile.name }}
      </VBtn>
    </template>
    <VList>
      <VListItem v-for="(item, i) in userMenu" :key="i" v-bind="item" @click="item.action" />
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
import AoiGravatar from './AoiGravatar.vue'

import { useAppState } from '@/stores/app'
import { useAppUserMenu } from '@/utils/menus'

defineProps<{
  dense?: boolean
}>()

const app = useAppState()
const userInfo = app.user

const userMenu = useAppUserMenu()
</script>
