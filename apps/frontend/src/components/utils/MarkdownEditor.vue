<template>
  <div class="d-flex flex-column">
    <div class="d-flex justify-space-between align-center">
      <div>
        <slot name="title">
          {{ label }}
        </slot>
      </div>
      <VBtnToggle v-model="mode" :rounded="0">
        <VBtn icon="mdi-file-edit-outline" />
        <VBtn icon="mdi-arrow-split-vertical" />
        <VBtn icon="mdi-file-eye-outline" />
      </VBtnToggle>
    </div>
    <div class="u-grid u-h-128" :class="mode === 1 ? ['u-grid-cols-2'] : ['u-grid-cols-1']">
      <MonacoEditor v-model="model" language="markdown" v-show="mode !== 2" />
      <MarkdownRenderer :md="model" v-show="mode !== 0" class="u-overflow-y-scroll" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import MarkdownRenderer from './MarkdownRenderer.vue'
import MonacoEditor from './MonacoEditor.vue'

defineProps<{
  label?: string
}>()
const model = defineModel<string>({ required: true })
const mode = ref(0)
</script>
