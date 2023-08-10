<template>
  <VCardText>
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
import type { ProblemConfigSubmitFormMetadata } from '@aoi/common'
import { watch } from 'vue'
import { reactive } from 'vue'

defineProps<{
  options: Partial<ProblemConfigSubmitFormMetadata>
}>()
const model = defineModel<string>({ required: true })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value = reactive<Record<string, any>>({})

watch(
  () => value,
  () => {
    model.value = JSON.stringify(value)
  },
  { deep: true }
)
</script>
