<template>
  <VApp>
    <AppBar />
    <AppNavDrawer />
    <VMain>
      <RouterView />
    </VMain>
  </VApp>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppBar from '@/components/app/AppBar.vue'
import AppNavDrawer from '@/components/app/AppNavDrawer.vue'
</script>
