<template>
  <VChip :color="color" :text="text" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { InstanceState, InstanceTaskState } from './types'

const { t } = useI18n()

const props = defineProps<{
  state: InstanceState
  taskState?: InstanceTaskState
}>()

const color = computed(() => {
  switch (props.state) {
    case InstanceState.DESTROYED:
      return 'error'
    case InstanceState.DESTROYING:
      return 'error'
    case InstanceState.ALLOCATED:
      return 'success'
    case InstanceState.ALLOCATING:
      return 'info'
    case InstanceState.ERROR:
      return 'error'
    default:
      return 'default'
  }
})

const text = computed(() => {
  const stateText = t(`instance.state.${InstanceState[props.state].toLowerCase()}`)
  if (!props.taskState) return stateText
  const taskText = t(`instance.task_state.${InstanceTaskState[props.taskState].toLowerCase()}`)
  return `${stateText} (${taskText})`
})
</script>
