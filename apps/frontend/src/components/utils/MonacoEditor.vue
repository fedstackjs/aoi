<template>
  <div ref="container" class="u-min-h-64"></div>
</template>

<script setup lang="ts">
import { useMonaco, type IMonacoEditorProps } from '@/utils/monaco'
import { ref } from 'vue'

const container = ref<HTMLElement>(null as never)

const model = defineModel<string>({ required: true })
const props = defineProps<IMonacoEditorProps>()

useMonaco(container, model, props)
</script>
