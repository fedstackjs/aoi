<template>
  <AsyncState :state="profile" hide-when-loading>
    <template v-slot="{ value }">
      <VChip :to="link" pill rounded variant="text">
        <VAvatar start>
          <AoiGravatar :email="value.emailHash" />
        </VAvatar>
        {{ value.name }}
        <VIcon end icon="mdi-account-multiple" v-if="value.principalType === 'group'" />
      </VChip>
    </template>
  </AsyncState>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { computed } from 'vue'

import AoiGravatar from '../aoi/AoiGravatar.vue'

import AsyncState from './AsyncState.vue'

import { getProfile } from '@/utils/profile'

const props = defineProps<{
  principalId: string
  to?: string
}>()

const profile = useAsyncState(async () => {
  const profile = await getProfile(props.principalId)
  return {
    ...profile,
    to: profile.principalType === 'user' ? `/user/${profile.principalId}` : ''
  }
}, null as never)

const link = computed(() => props.to ?? profile.state.value?.to)
</script>
