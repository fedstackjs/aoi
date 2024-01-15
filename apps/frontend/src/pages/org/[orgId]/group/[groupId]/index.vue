<template>
  <VCardTitle>
    <VAvatar>
      <AppGravatar :email="group.profile.email" />
    </VAvatar>
    {{ group.profile.name }}
  </VCardTitle>
</template>

<script setup lang="ts">
import AppGravatar from '@/components/app/AppGravatar.vue'
import type { IGroupDTO } from '@/components/group/types'

defineProps<{
  group: IGroupDTO
}>()
</script>
