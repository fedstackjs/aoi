<template>
  <VCard>
    <AsyncState :state="posters" hide-when-loading>
      <template v-slot="{ value }">
        <VCarousel cycle show-arrows="hover" hide-delimiter-background class="h-auto">
          <template v-slot:prev="{ props }">
            <VBtn icon="mdi-chevron-left" variant="text" @click="props.onClick" />
          </template>
          <template v-slot:next="{ props }">
            <VBtn icon="mdi-chevron-right" variant="text" @click="props.onClick" />
          </template>
          <VCarouselItem v-for="(item, i) in value" :key="i" :src="item.url" :alt="item.title" />
        </VCarousel>
      </template>
    </AsyncState>
  </VCard>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core'

import AsyncState from '@/components/utils/AsyncState.vue'
import { http } from '@/utils/http'

const posters = useAsyncState(async () => {
  const resp = await http.get(`info/posters`)
  return await resp.json<
    Array<{
      title: string
      url: string
    }>
  >()
}, [])
</script>
