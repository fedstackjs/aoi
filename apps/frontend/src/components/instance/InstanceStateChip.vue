<template>
  <VChip :color="color" :text="text" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { InstanceState } from './types'

const { t } = useI18n()

const props = defineProps<{
  state: InstanceState
}>()

const color = computed(() => {
  switch (props.state) {
    case InstanceState.DESTROYED:
      return 'error'
    case InstanceState.PENDING:
      return 'warning'
    case InstanceState.QUEUED:
      return 'info'
    case InstanceState.ACTIVE:
      return 'success'
    case InstanceState.ERROR:
      return 'error'
    default:
      return 'default'
  }
})

const text = computed(() => {
  switch (props.state) {
    case InstanceState.DESTROYED:
      return t('instance.state.destroyed')
    case InstanceState.PENDING:
      return t('instance.state.pending')
    case InstanceState.QUEUED:
      return t('instance.state.queued')
    case InstanceState.ACTIVE:
      return t('instance.state.active')
    case InstanceState.ERROR:
      return t('instance.state.error')
    default:
      return t('instance.state.unknown')
  }
})
</script>
