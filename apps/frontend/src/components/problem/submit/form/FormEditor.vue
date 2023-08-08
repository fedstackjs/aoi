<template>
  <MonacoEditor v-model="model" :language="options.language" />
</template>

<script setup lang="ts">
import MonacoEditor from '@/components/utils/MonacoEditor.vue'
import type { Static, problemConfigSubmitFormEditorSchema } from '@aoi/common'

defineProps<{
  options: Partial<Static<typeof problemConfigSubmitFormEditorSchema>>
}>()
const model = defineModel<string>({ required: true })
</script>
