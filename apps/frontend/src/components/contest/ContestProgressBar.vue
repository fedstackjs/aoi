<template>
  <div class="u-flex u-flex-col u-items-center">
    <VBreadcrumbs density="compact" :items="items" divider="-"></VBreadcrumbs>
    <div class="u-self-stretch u-flex u-items-center u-gap-2">
      <VChip color="blue" :text="new Date(section.begin).toLocaleString()" />
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
      <VChip color="red" :text="new Date(section.end).toLocaleString()" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IContestDTO } from '@/components/contest/types'
import { ref } from 'vue'
import { onBeforeUnmount } from 'vue'
import ms from 'ms'
import type { IPlanContestDTO } from '../plan/types'

const props = defineProps<{ contest: IContestDTO | IPlanContestDTO }>()
const emit = defineEmits<{
  (ev: 'updated'): void
}>()
const now = ref(Date.now())

const items = computed(() =>
  props.contest.stages.map(({ name }) => ({
    title: name,
    disabled: props.contest.currentStage.name !== name
  }))
)

const section = computed(() => {
  const stages = props.contest.stages
  const i = stages.findIndex((stage) => stage.name === props.contest.currentStage.name)
  if (i <= 0 || i >= stages.length - 1) {
    if (i <= 0 && now.value >= stages[1].start) {
      emit('updated')
    }
    return {
      begin: stages[1].start,
      end: stages[stages.length - 1].start,
      progress: i <= 0 ? 0 : 100,
      stopped: i >= stages.length - 1
    }
  }
  const begin = stages[i].start
  const end = stages[i + 1].start
  if (now.value >= end) {
    emit('updated')
  }
  const progress = (100 * (now.value - begin)) / (end - begin)
  return {
    begin,
    end,
    tPlus: ms(now.value - begin),
    tMinus: ms(end - now.value),
    progress
  }
})

const intervalId = setInterval(() => {
  now.value = Date.now()
}, 1000)

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
</script>
