<template>
  <MonacoEditor v-model="model" :language="options.language" />
</template>

<script setup lang="ts">
import type { ProblemConfigSubmitFormEditor } from '@aoi-js/common'

import MonacoEditor from '@/components/utils/MonacoEditor.vue'

defineProps<{
  options: Partial<ProblemConfigSubmitFormEditor>
}>()
const model = defineModel<string>({ required: true })
</script>
