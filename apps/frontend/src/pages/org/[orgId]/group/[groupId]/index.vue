<template>
  <VCardTitle>
    <VAvatar>
      <AoiGravatar :email="group.profile.email" />
    </VAvatar>
    {{ group.profile.name }}
  </VCardTitle>
</template>

<script setup lang="ts">
import AoiGravatar from '@/components/aoi/AoiGravatar.vue'
import type { IGroupDTO } from '@/components/group/types'

defineProps<{
  group: IGroupDTO
}>()
</script>
