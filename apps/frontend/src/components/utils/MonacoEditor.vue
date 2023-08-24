<template>
  <div ref="container" class="u-min-h-64"></div>
</template>

<script setup lang="ts">
import { useMonaco } from '@/utils/monaco'
import { ref } from 'vue'
import { toRefs } from 'vue'

const container = ref<HTMLElement>(null as never)

const model = defineModel<string>({ required: true })
const props = defineProps<{
  language?: string
  theme?: string
  readonly?: boolean
}>()

useMonaco(container, model, toRefs(props))
</script>
