<template>
  <VCard>
    <RanklistViewer :endpoint="`rk/${ranklistId}`" />
  </VCard>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

import RanklistViewer from '@/components/contest/RanklistViewer.vue'

const route = useRoute()

const ranklistId = route.params.ranklistId as string
</script>
