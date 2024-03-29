<template>
  <VChip
    :prepend-icon="display[0]"
    :color="display[1]"
    :variant="abbrev ? 'text' : 'outlined'"
    :to="to"
  >
    {{ status }}
    <span v-if="score !== undefined">
      (<code :style="{ color: palette(score) }" v-text="score" />)
    </span>
  </VChip>
</template>

<script setup lang="ts">
import { useSolutionStatus, type ISolutionStatusProps } from './SolutionStatus'

import { palette } from '@/utils/colors'

const props = defineProps<ISolutionStatusProps>()

const { display, status } = useSolutionStatus(props)
</script>
