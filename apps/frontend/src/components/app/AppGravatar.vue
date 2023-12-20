<template>
  <VImg :src="url">
    <template #error>
      <VIcon>mdi-account</VIcon>
    </template>
  </VImg>
</template>

<script setup lang="ts">
import { getAvatarUrl } from '@/utils/avatar'
import { computed } from 'vue'

const props = defineProps<{
  email: string
}>()

const url = computed(() => getAvatarUrl(props.email))
</script>
