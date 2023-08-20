<template>
  <div ref="container" class="u-min-h-64"></div>
</template>

<script setup lang="ts">
import monaco from '@/utils/monaco'
import { onMounted, ref } from 'vue'
import { onBeforeMount } from 'vue'
import { watch } from 'vue'
import { shallowRef } from 'vue'

const container = ref<HTMLElement>(null as never)
const editor = shallowRef<monaco.editor.IStandaloneCodeEditor>()

const model = defineModel<string>({ required: true })
const props = defineProps<{
  language?: string
  theme?: string
  readonly?: boolean
}>()

onMounted(() => {
  const instance = (editor.value = monaco.editor.create(container.value, {
    value: model.value,
    language: props.language,
    theme: props.theme,
    automaticLayout: true,
    readOnly: props.readonly
  }))
  instance.onDidChangeModelContent(() => {
    model.value = instance.getValue() ?? ''
  })
})

watch(
  () => model.value,
  (value) => {
    if (editor.value && editor.value.getValue() !== value) {
      editor.value.setValue(value)
    }
  }
)

onBeforeMount(() => {
  editor.value?.dispose()
})
</script>
