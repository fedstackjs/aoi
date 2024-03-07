<template>
  <VTextField v-bind="$attrs" :error="!!error" v-model="value" type="datetime-local" />
</template>

<script setup lang="ts">
import { useDateTimeTextField } from '@/utils/time'

const model = defineModel<number>({ default: 0 })

const { error, model: value } = useDateTimeTextField(model)
</script>
