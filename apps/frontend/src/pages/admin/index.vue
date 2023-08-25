<template>
  <VCard title="Dashboard" variant="flat">
    <VCardText>
      <img v-for="img in imgs" :src="img" :key="img" />
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { useServerInfo, useVersionImgs } from '@/utils/admin/version'

const { info } = useServerInfo()
const imgs = useVersionImgs(info)
</script>
