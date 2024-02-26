<template>
  <VApp>
    <AoiBar />
    <AoiNavDrawer />
    <VMain>
      <RouterView />
    </VMain>
    <AoiFooter />
  </VApp>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AoiBar from '@/components/aoi/AoiBar.vue'
import AoiNavDrawer from '@/components/aoi/AoiNavDrawer.vue'
import AoiFooter from '@/components/aoi/AoiFooter.vue'
</script>
