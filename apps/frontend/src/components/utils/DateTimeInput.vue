<template>
  <VTextField :error="error" v-model="value" :label="label" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'

const model = defineModel<number>({ required: true })
defineProps<{
  label?: string
}>()

function toDateTimeLocalString(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  const localDate = new Date(date.getTime() - offset)
  return localDate.toISOString().slice(0, 16)
}

const error = ref(false)

// convert model to datetime-local format
const value = computed({
  get: () => toDateTimeLocalString(new Date(model.value)),
  set: (val) => {
    const date = +new Date(val)
    if (Number.isNaN(date)) {
      error.value = true
    } else {
      error.value = false
      model.value = date
    }
  }
})
</script>
