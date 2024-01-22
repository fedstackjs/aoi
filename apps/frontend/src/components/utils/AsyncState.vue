<template>
  <slot name="error" v-if="state.error.value" :state="state" :error="state.error.value">
    <VAlert type="error">{{ state.error.value }}</VAlert>
  </slot>
  <slot name="loading" v-else-if="isLoading || forceLoading" :state="state">
    <VContainer v-if="hideWhenLoading">
      <VRow justify="center">
        <VProgressCircular indeterminate color="primary"></VProgressCircular>
      </VRow>
    </VContainer>
    <VProgressLinear v-else indeterminate color="primary" />
  </slot>
  <slot
    v-if="state.state.value && (!hideWhenLoading || !isLoading)"
    :state="state"
    :value="state.state.value"
  />
</template>

<script setup lang="ts" generic="Data, Params extends any[] = [], Shallow extends boolean = true">
import { debouncedRef, type UseAsyncStateReturn } from '@vueuse/core'

const props = defineProps<{
  state: UseAsyncStateReturn<Data, Params, Shallow>
  hideWhenLoading?: boolean
  forceLoading?: boolean
}>()

const isLoading = debouncedRef(props.state.isLoading)
</script>
