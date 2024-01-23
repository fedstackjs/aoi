<template>
  <VCard>
    <RanklistViewer :endpoint="`rk/${ranklistId}`" />
  </VCard>
</template>

<script setup lang="ts">
import RanklistViewer from '@/components/contest/RanklistViewer.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const ranklistId = route.params.ranklistId as string
</script>
