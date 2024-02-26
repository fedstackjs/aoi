<template>
  <VContainer v-if="isAdmin">
    <VCard>
      <VToolbar>
        <VToolbarTitle> AOI Admin Console </VToolbarTitle>
        <div class="u-grid u-grid-flow-col u-grid-rows-2 u-gap-1"></div>
        <VSpacer />
        <VBtn to="/admin/" text="Dashboard" variant="text" exact />
        <VBtn to="/admin/user" text="Users" variant="text" />
        <VBtn to="/admin/misc" text="Misc" variant="text" />
      </VToolbar>
      <RouterView />
    </VCard>
  </VContainer>
  <AoiNotFound v-else />
</template>

<script setup lang="ts">
import AoiNotFound from '@/components/aoi/AoiNotFound.vue'
import { useUserCapability } from '@/utils/capability'

const isAdmin = useUserCapability('admin')
</script>
