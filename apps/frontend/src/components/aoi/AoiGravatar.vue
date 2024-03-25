<template>
  <VImg :src="url">
    <template #error>
      <div class="u-w-full u-h-full u-flex u-justify-center u-items-center">
        <VIcon size="48" color="secondary">mdi-account-circle</VIcon>
      </div>
    </template>
  </VImg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { getAvatarUrl } from '@/utils/avatar'

const props = defineProps<{
  email: string
}>()

const url = computed(() => getAvatarUrl(props.email))
</script>
