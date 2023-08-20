<template>
  <JsonViewer :endpoint="endpoint">
    <template v-slot="{ value }">
      <VCardText>
        {{ value }}
      </VCardText>
    </template>
  </JsonViewer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import JsonViewer from '../utils/JsonViewer.vue'

const props = defineProps<{
  problemId?: string
  contestId?: string
  solutionId: string
}>()

const endpoint = computed(() =>
  props.contestId
    ? `contest/${props.contestId}/solution/${props.solutionId}/details`
    : `problem/${props.problemId}/solution/${props.solutionId}/details`
)
</script>
