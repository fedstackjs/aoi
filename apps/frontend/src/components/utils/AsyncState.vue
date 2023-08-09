<template>
  <slot name="loading" v-if="state.isLoading.value" :state="state">
    <VProgressCircular indeterminate color="primary"></VProgressCircular>
  </slot>
  <slot name="error" v-else-if="state.error.value" :state="state" :error="state.error.value">
    <VAlert type="error">{{ state.error.value }}</VAlert>
  </slot>
  <slot
    v-else-if="state.state.value"
    :state="state"
    :value="state.state.value as NonNullable<Data>"
  />
</template>

<script setup lang="ts" generic="Data, Params extends any[] = [], Shallow extends boolean = true">
import type { UseAsyncStateReturn } from '@vueuse/core'

defineProps<{
  state: UseAsyncStateReturn<Data, Params, Shallow>
}>()
</script>
