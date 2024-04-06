<template>
  <div class="u-flex u-flex-col u-items-center">
    <VBreadcrumbs density="compact" :items="items" divider="-">
      <template v-slot:title="{ item }">
        {{ t(`stages.${item.title}`) }}
      </template>
    </VBreadcrumbs>
    <div class="u-self-stretch u-flex u-items-center u-gap-2">
      <VChip color="blue" :text="denseDateString(section.begin)" />
      <VChip v-if="section.tPlus" :text="'T+' + section.tPlus" />
      <div class="u-flex-1">
        <VProgressLinear
          height="10"
          :striped="!section.stopped"
          color="light-green"
          :model-value="section.progress"
        />
      </div>
      <VChip v-if="section.tMinus" :text="'T-' + section.tMinus" />
      <VChip color="red" :text="denseDateString(section.end)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import {
  useContestProgressBar,
  type IContestProgressBarProps,
  type IContestProgressBarEmits
} from './ContestProgressBar'

import { denseDateString } from '@/utils/time'

const props = defineProps<IContestProgressBarProps>()
const emit = defineEmits<IContestProgressBarEmits>()

const { t } = useI18n()

const { items, section } = useContestProgressBar(props, emit)
</script>
