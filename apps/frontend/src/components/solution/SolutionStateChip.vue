<template>
  <VChip :text="t(`solution.state.${state[0]}`)" :prepend-icon="state[1]" :color="state[2]" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  state: number
}>()

const { t } = useI18n()

const stateMap = {
  0: ['created', 'mdi-moon-new', 'grey'],
  1: ['pending', 'mdi-timer-sand', 'orange'],
  2: ['queued', 'mdi-cloud-outline', 'blue'],
  3: ['running', 'mdi-play', 'indigo'],
  4: ['completed', 'mdi-check', 'success']
} as const
const state = computed(() => stateMap[props.state as never] ?? ['unknown', 'mdi-help', 'grey'])
</script>
