<template>
  <VCardText class="py-0">
    <div v-for="item of options.items ?? []" :key="item.key">
      <VTextField
        v-if="item.type.text"
        v-model="value[item.key]"
        :label="item.label"
        :hint="item.description"
      />
      <VSelect
        v-if="item.type.select"
        v-model="value[item.key]"
        :label="item.label"
        :hint="item.description"
        :items="item.type.select.options"
      />
    </div>
  </VCardText>
</template>

<script setup lang="ts">
import type { ProblemConfigSubmitFormMetadata } from '@aoi-js/common'
import { watch, reactive } from 'vue'

defineProps<{
  options: Partial<ProblemConfigSubmitFormMetadata>
}>()
const model = defineModel<string>({ required: true })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value = reactive(
  (() => {
    try {
      return JSON.parse(model.value)
    } catch (err) {
      console.warn(err)
      return {}
    }
  })()
)

watch(
  () => value,
  () => {
    model.value = JSON.stringify(value)
  },
  { deep: true }
)
</script>
