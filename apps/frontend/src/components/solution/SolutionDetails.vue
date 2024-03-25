<template>
  <component :is="JsonViewer<SolutionDetails>" :endpoint="endpoint">
    <template v-slot="{ value }">
      <SolutionDetailsRenderer :value="value" />
    </template>
  </component>
</template>

<script setup lang="ts">
import type { SolutionDetails } from '@aoi-js/common'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import JsonViewer from '../utils/JsonViewer.vue'

import SolutionDetailsRenderer from './SolutionDetailsRenderer.vue'

const { t } = useI18n()

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
