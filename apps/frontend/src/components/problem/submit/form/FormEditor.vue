<template>
  <MonacoEditor v-model="model" :language="options.language" />
</template>

<script setup lang="ts">
import MonacoEditor from '@/components/utils/MonacoEditor.vue'
import type { ProblemConfigSubmitFormEditor } from '@aoi/common'

defineProps<{
  options: Partial<ProblemConfigSubmitFormEditor>
}>()
const model = defineModel<string>({ required: true })
</script>
