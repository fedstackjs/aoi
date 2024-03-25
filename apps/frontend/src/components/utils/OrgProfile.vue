<template>
  <VListItem :to="`/org/${orgId}`" exact>
    <template #prepend>
      <VAvatar rounded="lg">
        <AoiGravatar :email="orgProfile.state.value?.profile.email ?? ''" />
      </VAvatar>
    </template>
    <VListItemTitle>{{ orgProfile.state.value?.profile.name }}</VListItemTitle>
    <VOverlay
      :model-value="orgProfile.isLoading.value"
      contained
      class="align-center justify-center"
    >
      <VProgressCircular color="primary" indeterminate />
    </VOverlay>
  </VListItem>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'
import { watch } from 'vue'

import AoiGravatar from '../aoi/AoiGravatar.vue'

import type { IOrgProfile } from '@/types'
import { http } from '@/utils/http'

const props = defineProps<{
  orgId: string
}>()

const orgProfile = useAsyncState(async () => {
  const resp = await http.get(`org/${props.orgId}`)
  return resp.json<{ profile: IOrgProfile; membership: { capability: string } }>()
}, null)

watch(
  () => props.orgId,
  () => orgProfile.execute(),
  { immediate: true }
)
</script>
