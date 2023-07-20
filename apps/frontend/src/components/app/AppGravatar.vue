<template>
  <VImg :src="'https://cravatar.cn/avatar/' + hash">
    <template #error>
      <VIcon>mdi-account</VIcon>
    </template>
  </VImg>
</template>

<script setup lang="ts">
import md5 from 'blueimp-md5'
import { computed } from 'vue'

const props = defineProps<{
  email: string
}>()

const hash = computed(() => md5(props.email))
</script>
