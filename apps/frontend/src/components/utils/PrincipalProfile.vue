<template>
  <AsyncState :state="profile" hide-when-loading>
    <template v-slot="{ value }">
      <VAvatar>
        <AppGravatar :email="value.emailHash" />
      </VAvatar>
      <code class="u-pl-2">
        <RouterLink v-if="to" :to="to">
          {{ value.name }}
        </RouterLink>
        <span v-else>{{ value.name }}</span>
      </code>
      <VIcon icon="mdi-account-multiple" v-if="value.principalType === 'group'" />
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import AsyncState from './AsyncState.vue'
import AppGravatar from '../app/AppGravatar.vue'
import { useAsyncState } from '@vueuse/core'
import { getProfile } from '@/utils/profile'

const props = defineProps<{
  principalId: string
  to?: string
}>()

const profile = useAsyncState(async () => {
  return getProfile(props.principalId)
}, null as never)
</script>
