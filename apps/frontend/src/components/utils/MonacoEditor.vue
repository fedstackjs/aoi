<template>
  <div ref="container" class="u-min-h-64"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useMonaco, type IMonacoEditorProps } from '@/utils/monaco'

const container = ref<HTMLElement>(null as never)

const model = defineModel<string>({ required: true })
const props = defineProps<IMonacoEditorProps>()

useMonaco(container, model, props)
</script>
